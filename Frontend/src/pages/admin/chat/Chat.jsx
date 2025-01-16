import { Input, Layout, Modal, Tooltip } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BsMoonFill, BsSunFill } from 'react-icons/bs';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  deleteMessageApi,
  getAllUsersApi,
  getCurrentUserApi,
  getMessagesApi,
  sendFileApi,
  sendMessageApi,
  sendNotificationApi,
  updateMessageApi,
} from '../../../api/api';
import AllUsers from '../../../components/Chat/AllUsers';
import ChatHeader from '../../../components/Chat/ChatHeader';
import ChatInput from '../../../components/Chat/ChatInput';
import ChatMessages from '../../../components/Chat/ChatMessages';

const { Content } = Layout;
const currentUser = JSON.parse(localStorage.getItem('user'));

const Chat = ({ socket }) => {
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [users, setUsers] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const params = useParams();
  const typingTimeoutRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    socket.emit('newUser', currentUser.id);
    return () => {
      socket.off('message');
      socket.off('typingNow');
      socket.off('sended');
    };
  }, [socket]);

  useEffect(() => {
    getAllUsersApi()
      .then((res) => setUsers(res.data.users))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    setLoading(true);

    if (params.id === currentUser.id) {
      toast.error("You can't chat with yourself");
      setLoading(false);
      return;
    }

    if (user?._id !== params.id) {
      setMessages([]);
      setPage(1);
    }

    Promise.all([getCurrentUserApi(params.id), getMessagesApi(params.id, 1)])
      .then(([userRes, messagesRes]) => {
        setUser(userRes.data.data);
        setMessages(messagesRes.data.messages.reverse());
        setLoading(false);
        setHasMore(messagesRes.data.messages.length === 20);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load chat data');
        setLoading(false);
      });

    socket.on('message', handleNewMessage);
    socket.on('messageUpdated', handleMessageUpdate);
    socket.on('messageDeleted', handleMessageDelete);
    socket.on('typingNow', handleTypingIndicator);
    socket.on('receiveMessage', handleReceiveMessage);

    return () => {
      socket.off('message', handleNewMessage);
      socket.off('messageUpdated', handleMessageUpdate);
      socket.off('messageDeleted', handleMessageDelete);
      socket.off('typingNow', handleTypingIndicator);
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [params.id]);

  const handleNewMessage = useCallback(
    (message) => {
      if (
        params.id === message.sender._id ||
        params.id === message.receiver._id
      ) {
        setMessages((prevMessages) => [...prevMessages, message]);
        const notification = {
          message: `New message from ${message.sender.firstName}`,
          receiver: message.receiver._id,
        };
        handleNotification(notification);
        scrollToBottom();
      }
    },
    [params.id]
  );

  const handleReceiveMessage = useCallback((message) => {
    toast.info(`${message.sender.firstName} sent you a message`, {
      position: 'bottom-right',
      autoClose: 3000,
    });
  }, []);

  const handleNotification = useCallback(
    (notification) => {
      sendNotificationApi(notification)
        .then((res) => {
          const newNotification = res.data.newNotification;
          socket.emit('sendNotification', newNotification);
        })
        .catch((err) => {
          console.error(err);
        });
    },
    [socket]
  );

  const handleMessageUpdate = useCallback((updatedMessage) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg._id === updatedMessage._id ? updatedMessage : msg
      )
    );
  }, []);

  const handleMessageDelete = useCallback((deletedMessageId) => {
    setMessages((prevMessages) =>
      prevMessages.filter((msg) => msg._id !== deletedMessageId)
    );
  }, []);

  const handleTypingIndicator = useCallback(
    (data) => {
      if (data.sender === params.id) {
        setIsTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
      }
    },
    [params.id]
  );

  const fetchMoreMessages = useCallback(() => {
    if (!hasMore) return;
    setPage((prevPage) => prevPage + 1);
    getMessagesApi(params.id, page + 1)
      .then((res) => {
        const newMessages = res.data.messages.reverse();
        setMessages((prevMessages) => [...newMessages, ...prevMessages]);
        setHasMore(newMessages.length === 20);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load more messages');
      });
  }, [hasMore, params.id, page]);

  const sendMessage = useCallback(
    (text, type) => {
      const data = {
        message: text,
        receiver: params.id,
        sender: currentUser.id,
        type: type,
      };

      sendMessageApi(data)
        .then((res) => {
          scrollToBottom();
        })
        .catch((err) => {
          toast.error('Failed to send message');
        });
    },
    [params.id]
  );

  const editMessage = useCallback(
    (messageId, newText) => {
      updateMessageApi(messageId, newText)
        .then((res) => {
          socket.emit('updateMessage', res.data.updatedMessage);
          setEditingMessage(null);
        })
        .catch((err) => {
          toast.error('Failed to edit message');
        });
    },
    [socket]
  );

  const deleteMessage = useCallback(
    (messageId) => {
      deleteMessageApi(messageId)
        .then(() => {
          socket.emit('deleteMessage', messageId);
        })
        .catch((err) => {
          toast.error('Failed to delete message');
        });
    },
    [socket]
  );

  const handleTyping = useCallback(() => {
    socket.emit('typing', { receiver: params.id, sender: currentUser.id });
  }, [socket, params.id]);

  const onFileUpload = useCallback(
    (file) => {
      const formData = new FormData();
      formData.append('file', file);

      const config = {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setFileUploadProgress(percentCompleted);
        },
      };

      sendFileApi(formData, config)
        .then((res) => {
          sendMessage(res.data.file, res.data.type);
          setFileUploadProgress(0);
        })
        .catch((err) => {
          toast.error('Failed to upload file');
          setFileUploadProgress(0);
        });
    },
    [sendMessage]
  );

  const handleEmojiClick = useCallback((emoji) => {
    setCurrentInput((prevInput) => prevInput + emoji);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  return (
    <div
      className={`tw-ml-0 lg:tw-ml-64 min-h-screen tw-relative ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'
      }`}>
      <Layout
        className={`h-screen ${
          darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'
        }`}>
        <Content className='p-4 md:p-6 lg:p-8'>
          <div className='mx-auto flex h-full max-w-6xl flex-col md:flex-row'>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: '25%', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className='mb-4 md:mb-0 md:mr-4 md:w-1/3 lg:w-1/4'>
                  <AllUsers
                    users={users}
                    loading={loading}
                    onClick={() => {
                      setMessages([]);
                      setPage(1);
                    }}
                    activeUser={params.id}
                    darkMode={darkMode}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <div
              className={`flex flex-grow flex-col overflow-hidden rounded-lg shadow-lg ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
              {loading ? (
                <div className='flex h-full items-center justify-center'>
                  <div className='loader'></div>
                </div>
              ) : (
                <>
                  <ChatHeader
                    user={user}
                    darkMode={darkMode}
                    onToggleSidebar={toggleSidebar}
                  />
                  <div
                    id='scrollableDiv'
                    ref={chatContainerRef}
                    className='flex-grow overflow-y-auto p-4'>
                    <InfiniteScroll
                      dataLength={messages.length}
                      next={fetchMoreMessages}
                      hasMore={hasMore}
                      loader={<div className='loader'></div>}
                      scrollableTarget='scrollableDiv'
                      inverse={true}
                      style={{
                        display: 'flex',
                        flexDirection: 'column-reverse',
                      }}>
                      <ChatMessages
                        messages={messages}
                        isTyping={isTyping}
                        darkMode={darkMode}
                        currentUser={currentUser}
                        onEditMessage={(message) => setEditingMessage(message)}
                        onDeleteMessage={deleteMessage}
                      />
                    </InfiniteScroll>
                  </div>
                  <ChatInput
                    onSendMessage={sendMessage}
                    onTyping={handleTyping}
                    onFileUpload={onFileUpload}
                    darkMode={darkMode}
                    showEmojiPicker={showEmojiPicker}
                    setShowEmojiPicker={setShowEmojiPicker}
                    currentInput={currentInput}
                    setCurrentInput={setCurrentInput}
                    fileUploadProgress={fileUploadProgress}
                  />
                </>
              )}
            </div>
          </div>
        </Content>
        <Modal
          visible={editingMessage !== null}
          onCancel={() => setEditingMessage(null)}
          onOk={() => {
            editMessage(editingMessage._id, currentInput);
            setCurrentInput('');
          }}
          title='Edit Message'>
          <Input
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onPressEnter={() => {
              editMessage(editingMessage._id, currentInput);
              setCurrentInput('');
              setEditingMessage(null);
            }}
          />
        </Modal>
        {/* {showEmojiPicker && (
          <EmojiPickerComponent onEmojiClick={handleEmojiClick} />
        )} */}
      </Layout>
      <Tooltip
        title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
        <div
          className='fixed bottom-4 right-4 p-2 rounded-full cursor-pointer'
          onClick={toggleDarkMode}
          style={{
            backgroundColor: darkMode ? '#ffffff' : '#1a202c',
            color: darkMode ? '#1a202c' : '#ffffff',
          }}>
          {darkMode ? <BsSunFill size={24} /> : <BsMoonFill size={24} />}
        </div>
      </Tooltip>
    </div>
  );
};

export default Chat;
