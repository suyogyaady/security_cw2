import React from 'react';

const ChatHeader = ({ user }) => {
  return (
    <header className='flex items-center justify-between bg-purple-600 p-4 text-white'>
      <div className='flex items-center'>
        <h1 className='hidden text-xl font-bold sm:inline'>
          Home Bike Service
          {user?.fullName}
        </h1>
      </div>
    </header>
  );
};

export default ChatHeader;
