import { motion } from 'framer-motion';
import debounce from 'lodash/debounce';
import React, { useEffect, useState } from 'react';
import { FaMotorcycle, FaSearch } from 'react-icons/fa';
import { getAllBikeApi } from '../../api/api';

const Search = () => {
  const [bikes, setBikes] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getAllBikeApi().then((res) => {
      console.log(res.data.bikes);
      setBikes(res.data.bikes);
      setSearchResults(res.data.bikes);
      setLoading(false);
    });
  }, []);

  const debouncedSearch = debounce((query) => {
    const filteredBikes = bikes.filter((bike) =>
      bike.bikeName.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filteredBikes);
  }, 300);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    debouncedSearch(query);
  };

  return (
    <div className='container mx-auto px-4 mt-16'>
      <h1 className='text-4xl font-bold text-center mb-8 flex items-center justify-center'>
        <FaMotorcycle className='mr-4' />
        Bike Search
      </h1>
      <div className='relative mb-8'>
        <input
          type='text'
          className='w-full p-4 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200'
          placeholder='Search for bikes...'
          onChange={handleSearchChange}
          value={searchTerm}
        />
        <FaSearch className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400' />
      </div>

      {loading ? (
        <div className='flex justify-center items-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500'></div>
        </div>
      ) : searchResults.length > 0 ? (
        <motion.div
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}>
          {searchResults.map((bike) => (
            <motion.div
              key={bike.id}
              className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300'
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}>
              <div className='p-6'>
                <h2 className='text-xl font-semibold mb-2'>{bike.bikeName}</h2>
                <p className='text-gray-600 mb-4'>{bike.bikePrice}</p>
                <button className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300'>
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div
          className='bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded'
          role='alert'>
          <p className='font-bold'>No bikes found</p>
          <p>Try a different search term.</p>
        </div>
      )}
    </div>
  );
};

export default Search;
