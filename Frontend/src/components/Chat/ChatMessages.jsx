import { DeleteOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Popconfirm, Tooltip } from 'antd';
import moment from 'moment';
import React from 'react';
import { messageFileUrl, messageImageUrl } from '../../api/api';

const ChatMessages = ({
  messages,
  isTyping,
  darkMode,
  currentUser,
  onEditMessage,
  onDeleteMessage,
}) => {
  const renderMessage = (message) => {
    const isOwnMessage = message.sender._id === currentUser.id;
    const isFile = message.type === 'file';
    const isImage = message.type === 'image';
    const messageClass = isOwnMessage
      ? `flex justify-end`
      : `flex justify-start`;
    const bubbleClass = isOwnMessage
      ? `bg-blue-500 text-white`
      : darkMode
      ? `bg-gray-700 text-white`
      : `bg-gray-200 text-black`;

    return (
      <div
        key={message._id}
        className={`mb-4 ${messageClass}`}>
        <div className={`max-w-xs rounded-lg p-3 lg:max-w-md ${bubbleClass}`}>
          <div className='mb-2 flex items-center'>
            <Avatar
              icon={<UserOutlined />}
              src={message.sender.avatar}
              className={`${isOwnMessage ? 'order-2 ml-2' : 'order-1 mr-2'}`}
            />
            <span className='text-xs font-semibold'>
              {isOwnMessage ? 'You' : message.sender.firstName}
            </span>
            {isOwnMessage && (
              <div className='ml-auto flex'>
                <Tooltip title='Edit'>
                  <EditOutlined
                    onClick={() => onEditMessage(message)}
                    className='mr-2 cursor-pointer text-white hover:text-gray-300'
                  />
                </Tooltip>
                <Tooltip title='Delete'>
                  <Popconfirm
                    title='Are you sure you want to delete this message?'
                    onConfirm={() => onDeleteMessage(message._id)}
                    okText='Yes'
                    cancelText='No'>
                    <DeleteOutlined className='cursor-pointer text-white hover:text-gray-300' />
                  </Popconfirm>
                </Tooltip>
              </div>
            )}
          </div>
          <p className='break-words'>
            {isFile ? (
              <a
                href={`${messageFileUrl}/${message.message}`}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-300 hover:underline'>
                {message.message}
              </a>
            ) : isImage ? (
              <img
                src={`${messageImageUrl}/${message.message}`}
                alt='message'
                className='max-w-full rounded-lg'
              />
            ) : (
              message.message
            )}
          </p>
          <div className='mt-1 text-right text-xs opacity-70'>
            {moment(message.createdAt).format('HH:mm')}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`flex-grow overflow-y-auto p-4 ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
      {messages.map(renderMessage)}
      {isTyping && (
        <div className='flex justify-start'>
          <div
            className={`max-w-xs rounded-lg p-3 ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
            <div className='typing-indicator flex space-x-1'>
              <span className='h-2 w-2 bg-gray-400 rounded-full animate-bounce'></span>
              <span className='h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-200'></span>
              <span className='h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-400'></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
