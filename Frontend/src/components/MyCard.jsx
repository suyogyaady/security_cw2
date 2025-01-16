import React from 'react';
import { Link } from 'react-router-dom';

const MyCard = ({ bikeInformation, color }) => {
  return (
    <div
      class='card'
      style={{ width: '18rem' }}>
      <span
        style={{
          backgroundColor: color,
        }}
        className='badge position-absolute top-0'>
        {bikeInformation.bikeName}
      </span>

      <img
        src={`http://localhost:5000/bikes/${bikeInformation.bikeImage}`}
        class='card-img-top'
        alt={bikeInformation.bikeName}
        style={{
          width: '100%',
          height: '300px',
          objectFit: 'cover',
        }}
      />
      <div class='card-body'>
        <div className='d-flex justify-content-between'>
          <h5 class='card-title'>{bikeInformation.bikeName}</h5>
        </div>
        <Link
          to={`/bike/${bikeInformation.bikeName}`}
          // to={{
          //   pathname: `/bike/model`,
          // }}
          class='btn btn-outline-dark w-100'>
          {bikeInformation.bikeName}
        </Link>
      </div>
    </div>
  );
};

export default MyCard;
