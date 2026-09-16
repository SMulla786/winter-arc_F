import React, {useEffect, useState} from 'react';
import {FiTag, FiUsers} from 'react-icons/fi';
import Additionalvendors from '@/components/FoodVender/Additionalvendors';
import AdditionalvendorCat from '@/components/FoodVender/AdditionalvendorCat';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {useNavigate} from '@tanstack/react-router';

const AdditionalVendorsManagement: React.FC = () => {
  return (
    <div className="rounded-lg">
      {/* Content */}
      <div>
        <Additionalvendors />
      </div>
    </div>
  );
};

export default AdditionalVendorsManagement;
