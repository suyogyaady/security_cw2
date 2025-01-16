import {
  PaperClipOutlined,
  SendOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import { Button, Input, Upload } from 'antd';
import React from 'react';

const ChatInput = ({
  onSendMessage,
  onTyping,
  onFileUpload,
  darkMode,
  showEmojiPicker,
  setShowEmojiPicker,
  currentInput,
  setCurrentInput,
  fileUploadProgress,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentInput.trim()) {
      onSendMessage(currentInput);
      setCurrentInput('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`border-t p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className='flex items-center'>
        <Input
          value={currentInput}
          onChange={(e) => {
            setCurrentInput(e.target.value);
            onTyping();
          }}
          placeholder='Type a message'
          className={`mr-2 flex-grow ${
            darkMode ? 'bg-gray-700 text-white' : ''
          }`}
        />
        <Button
          icon={<SmileOutlined />}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className='mr-2'
        />
        <Upload
          beforeUpload={(file) => {
            onFileUpload(file);
            return false;
          }}
          showUploadList={false}>
          <Button
            icon={<PaperClipOutlined />}
            className='mr-2'
          />
        </Upload>
        <Button
          type='primary'
          htmlType='submit'
          icon={<SendOutlined />}>
          Send
        </Button>
      </div>
      {fileUploadProgress > 0 && (
        <div className='h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
          <div
            className='h-2.5 rounded-full bg-blue-600'
            style={{ width: `${fileUploadProgress}%` }}></div>
        </div>
      )}
    </form>
  );
};

export default ChatInput;
