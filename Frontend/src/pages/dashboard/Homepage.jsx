import { motion } from "framer-motion";
import React from "react";
import { Link } from "react-router-dom";

const FeatureCard = ({ image, title, description, buttonText }) => (
  <motion.div
    className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl overflow-hidden border border-gray-100"
    whileHover={{ scale: 1.02, y: -5 }}
    transition={{ duration: 0.2 }}
  >
    <div className="relative">
      <img src={image} alt={title} className="w-full h-56 object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
    <div className="p-8">
      <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        {title}
      </h3>
      <p className="text-gray-700 mb-6 leading-relaxed">{description}</p>
      <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300">
        {buttonText}
      </button>
    </div>
  </motion.div>
);

const Homepage = () => {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-800" />
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGM5Ljk0MSAwIDE4LTguMDU5IDE4LTE4cy04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNCAtMTQgMTQgNi4yNjggMTQgMTQtNi4yNjggMTQtMTQgMTR6Ii8+PC9nPjwvc3ZnPg==')]" />
        <div className="container mx-auto px-6 py-24 relative">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div
              className="w-full md:w-1/2 text-center md:text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Door Step Two Wheel Service
              </h1>
              <p className="text-xl text-gray-100 mb-8 leading-relaxed">
                No need to worry about going to workshop to service your bike.
                Get it done in front of your eyes.
              </p>
              <motion.button
                className="bg-white text-blue-600 py-4 px-8 rounded-full font-bold shadow-lg hover:bg-blue-50 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Book Now
              </motion.button>
            </motion.div>
            <motion.div
              className="w-full md:w-1/2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <img
                src="assets/images/home.png"
                alt="Home Bike Service"
                className="w-full rounded-2xl shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div
              className="w-full md:w-1/2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img
                src="assets/images/logo.png"
                alt="Home Bike Service Logo"
                className="w-full max-w-lg mx-auto rounded-xl shadow-xl"
              />
            </motion.div>
            <motion.div
              className="w-full md:w-1/2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                About Home Bike Service
              </h2>
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                Home bike service offers the convenience of professional bicycle
                maintenance and repair at your doorstep. This service typically
                includes basic tune-ups, such as brake and gear adjustments,
                chain lubrication, and tire inflation, ensuring your bike
                remains in optimal condition.
              </p>
              <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                These services are particularly beneficial for busy individuals
                or those without easy access to a bike repair shop. By having a
                professional come to your home, you save time and effort,
                ensuring your bike is always ready for use.
              </p>
              <Link
                to="/about"
                className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-8 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
              >
                Read More About Us
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.h2
            className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Our Features
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              image="assets/images/service.jpg"
              title="Bike Service"
              description="Ride Confidently with Our Expert Care!"
              buttonText="Service Now"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
