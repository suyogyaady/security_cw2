import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createServiceApi, deleteServiceApi, getAllServiceApi } from '../../../api/api';

const ServiceDashboard = () => {
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');
  const [serviceImage, setServiceImage] = useState(null);

  const [previewImage, setPreviewImage] = useState(null);

  const [serviceNameError, setServiceNameError] = useState('');
  const [serviceDescriptionError, setServiceDescriptionError] = useState('');
  const [servicePriceError, setServicePriceError] = useState('');
  const [serviceCategoryError, setServiceCategoryError] = useState('');
  const [serviceImageError, setServiceImageError] = useState('');

  const [services, setServices] = useState([]);

  useEffect(() => {
    // get all services
    getAllServiceApi()
      .then((res) => {
        if (res.status === 201) {
          setServices(res.data.services);
        }
        console.log(services);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    setServiceImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  var validate = () => {
    if (serviceName.trim() === '') {
      setServiceNameError('Service Name is required');
      return false;
    }
    if (serviceDescription.trim() === '') {
      setServiceDescriptionError('Service Description is required');
      return false;
    }
    if (servicePrice.trim() === '') {
      setServicePriceError('Service Price is required');
      return false;
    }
    if (serviceCategory.trim() === '') {
      setServiceCategoryError('Service Category is required');
      return false;
    }
    if (serviceImage === '') {
      setServiceImageError('Service Image is required');
      return false;
    }
    return true;
  };

  // Handle Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    // make a form data (txt, file)
    const formData = new FormData();
    formData.append('serviceName', serviceName);
    formData.append('serviceDescription', serviceDescription);
    formData.append('servicePrice', servicePrice);
    formData.append('serviceCategory', serviceCategory);
    formData.append('serviceImage', serviceImage);

    // call the api
    createServiceApi(formData)
      .then((res) => {
        // For successful api
        if (res.status === 201) {
          toast.success(res.data.message);
          window.location.reload();
        }
      })
      .catch((err) => {
        // For error status code
        if (err.response) {
          if (err.response.status === 400) {
            toast.warning(err.response.data.message);
          } else if (err.response.status === 500) {
            toast.error(err.response.data.message);
          } else {
            toast.error('Something went wrong');
          }
        } else {
          toast.error('Something went wrong');
        }
      });
  };

  // handle delete
  const handleDelete = (id) => {
    const confirm = window.confirm('Are you sure you want to delete?');
    if (confirm) {
      deleteServiceApi(id)
        .then((res) => {
          if (res.status === 201) {
            // Add delay of 2 seconds
            toast.success(res.data.message);
            window.location.reload();
          }
        })
        .catch((err) => {
          if (err.response.status === 500) {
            toast.error(err.response.data.message);
          } else {
            toast.error('Something went wrong');
          }
        });
    }
  };

  return (
    <>
      <div className='container-fluid'>
        <div className='d-flex justify-content-between'>
          <div className=''>
            <h1>Service Dashboard</h1>
          </div>
          <div className=''>
            <button
              type='button'
              className='btn btn-primary'
              data-bs-toggle='modal'
              data-bs-target='#exampleModal'>
              Add Service
            </button>
            <div
              className='modal fade'
              id='exampleModal'
              tabindex='-1'
              aria-labelledby='exampleModalLabel'
              aria-hidden='true'>
              <div className='modal-dialog'>
                <div className='modal-content'>
                  <div className='modal-header'>
                    <h1
                      className='modal-title fs-5'
                      id='exampleModalLabel'>
                      Add Service
                    </h1>
                    <button
                      type='button'
                      className='btn-close'
                      data-bs-dismiss='modal'
                      aria-label='Close'></button>
                  </div>
                  <div className='modal-body'>
                    <form action='/'>
                      <div className='mb-3'>
                        <label
                          for='exampleFormControlInput1'
                          className='form-label'>
                          Service Name
                        </label>
                        <input
                          className='form-control'
                          placeholder='Service Name'
                          onChange={(e) => setServiceName(e.target.value)}
                        />
                        {serviceNameError && (
                          <p className='text-danger'>{serviceNameError}</p>
                        )}
                      </div>
                      <div className='mb-3'>
                        <label
                          for='serviceDescription'
                          className='form-label'>
                          Service Description
                        </label>
                        <textarea
                          className='form-control'
                          onChange={(e) => setServiceDescription(e.target.value)}
                          rows='3'></textarea>
                        {serviceDescriptionError && (
                          <p className='text-danger'>{serviceDescriptionError}</p>
                        )}
                      </div>
                      <div className='mb-3'>
                        <label
                          for='exampleFormControlInput1'
                          className='form-label'>
                          Service Price
                        </label>
                        <input
                          className='form-control'
                          placeholder='Service Price'
                          onChange={(e) => setServicePrice(e.target.value)}
                        />
                        {servicePriceError && (
                          <p className='text-danger'>{servicePriceError}</p>
                        )}
                      </div>
                      <div className='mb-3'>
                        <label
                          for='exampleFormControlInput1'
                          className='form-label'>
                          Service Category
                        </label>
                        <select
                          className='form-control'
                          onChange={(e) => setServiceCategory(e.target.value)}>
                          <option value='Nacked Sports'>Nacked Sports</option>
                          <option value='Sports'>Sports</option>
                          <option value='Dirt'>Dirt</option>
                          <option value='Cruiser'>Cruiser</option>
                          <option value='Adventure'>Adventure</option>
                          <option value='Touring'>Touring</option>
                        </select>
                        {serviceCategoryError && (
                          <p className='text-danger'>{serviceCategoryError}</p>
                        )}
                      </div>
                      <div className='mb-3'>
                        <label
                          for='exampleFormControlInput1'
                          className='form-label'
                          onChange={(e) => setServiceImage(e.target.value)}>
                          Service Image
                        </label>
                        <input
                          onChange={handleImageChange}
                          className='form-control'
                          type='file'
                        />
                        {serviceImageError && (
                          <p className='text-danger'>{serviceImageError}</p>
                        )}
                      </div>
                      {previewImage && (
                        <div className='mb-2'>
                          <img
                            src={previewImage}
                            className='img-fluid rounded'
                            alt='service'
                          />
                        </div>
                      )}
                    </form>
                  </div>
                  <div className='modal-footer'>
                    <button
                      type='button'
                      className='btn btn-secondary'
                      data-bs-dismiss='modal'>
                      Close
                    </button>
                    <button
                      type='button'
                      className='btn btn-primary'
                      onClick={handleSubmit}>
                      Save changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <table className='table'>
          <thead className='table-dark'>
            <tr>
              <th scope='col'>Service Image</th>
              <th scope='col'>Service Name</th>
              <th scope='col'>Service Price</th>
              <th scope='col'>Service Description</th>
              <th scope='col'>Service Category</th>
              <th scope='col'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr>
                <td>
                  <img
                    src={`http://localhost:5000/services/${service.serviceImage}`}
                    alt={service.serviceName}
                    width='50px'
                  />
                </td>
                <td>{service.serviceName}</td>
                <td>{service.servicePrice}</td>
                <td>{service.serviceDescription}</td>
                <td>{service.serviceCategory}</td>
                <td>
                  <Link
                    to={'/admin/updateservice/' + service._id}
                    className='btn btn-primary mx-3'>
                    Edit
                  </Link>

                  <button
                    type='button'
                    class='btn btn-danger'
                    onClick={() => handleDelete(service._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ServiceDashboard;
