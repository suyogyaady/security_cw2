import { UserOutlined } from '@ant-design/icons';
import { Avatar, List, Spin } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

const AllUsers = ({ className, loading, users, onClick, activeUser }) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  return (
    <div className={`rounded-lg bg-gray-800 p-4 shadow-lg ${className}`}>
      <h2 className='animate__animated animate__fadeIn mb-4 text-2xl font-bold text-white'>
        All Users
      </h2>
      {loading ? (
        <div className='flex justify-center'>
          <Spin size='large' />
        </div>
      ) : (
        <List
          dataSource={users}
          renderItem={(user) => (
            <List.Item
              className={`animate__animated animate__fadeIn transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg ${
                activeUser === user._id
                  ? 'bg-gray-700 border-l-4 border-blue-500'
                  : ''
              }`}>
              <Link
                to={`/admin/chat/${user._id}`}
                className={`w-full flex items-center p-2 rounded-lg ${
                  activeUser === user._id ? 'bg-gray-700' : 'hover:bg-gray-700'
                }`}
                onClick={onClick}>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={<UserOutlined />}
                      src={user.avatar}>
                      {!user.avatar && getInitials(user.fullName)}
                    </Avatar>
                  }
                  title={
                    <span className='font-semibold text-white'>
                      {user.fullName}
                    </span>
                  }
                  description={
                    <span className='text-sm text-gray-400'>{user.email}</span>
                  }
                />
              </Link>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default AllUsers;
