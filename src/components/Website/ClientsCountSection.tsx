import {billImage, errorIcon, smileIcon} from '@/assets/images/webImages';
import React from 'react';

const ClientsCountSection = () => {
  return (
    <section className="clients-count from-gray-50 cursor-default bg-gradient-to-b to-white px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-gray-900 mb-4 text-3xl font-bold md:text-4xl">
            Trusted by Thousands of Restaurants
          </h2>
          <p className="text-gray-600 mx-auto max-w-2xl">
            Our numbers speak for themselves. Join the growing community of
            successful restaurants using our platform.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Happy Customers Card */}
          <div className="transform rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500">
                  <img
                    loading="lazy"
                    src={smileIcon}
                    alt="Happy customers"
                    className="h-8 w-8 invert filter"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4 text-center">
              <div className="flex items-baseline justify-center">
                <span
                  className="animate-count-up text-4xl font-bold text-blue-600 md:text-5xl"
                  data-target="75"
                >
                  75
                </span>
                <span className="ml-1 text-2xl font-bold text-blue-600">K</span>
              </div>
              <p className="text-gray-600 mt-2 font-semibold">
                Happy Customers
              </p>
            </div>

            <div className="mt-4 rounded-lg bg-blue-50 p-3">
              <p className="text-center text-sm text-blue-700">
                Restaurants love our intuitive platform
              </p>
            </div>
          </div>

          {/* Bills Processed Card */}
          <div className="transform rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
                  <img
                    loading="lazy"
                    src={billImage}
                    alt="Bills processed everyday"
                    className="h-8 w-8 invert filter"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4 text-center">
              <div className="flex items-baseline justify-center">
                <span
                  className="animate-count-up text-4xl font-bold text-green-600 md:text-5xl"
                  data-target="60"
                >
                  60
                </span>
                <span className="ml-1 text-2xl font-bold text-green-600">
                  L
                </span>
              </div>
              <p className="text-gray-600 mt-2 font-semibold">
                Bills Processed Daily
              </p>
            </div>

            <div className="mt-4 rounded-lg bg-green-50 p-3">
              <p className="text-center text-sm text-green-700">
                Reliable billing system for busy restaurants
              </p>
            </div>
          </div>

          {/* Processing Errors Card */}
          <div className="transform rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500">
                  <img
                    loading="lazy"
                    src={errorIcon}
                    alt="Processing errors"
                    className="h-8 w-8 invert filter"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4 text-center">
              <div className="flex items-baseline justify-center">
                <span
                  className="animate-count-up text-4xl font-bold text-red-600 md:text-5xl"
                  data-target="0"
                >
                  0
                </span>
                <span className="ml-1 text-2xl font-bold text-red-600">%</span>
              </div>
              <p className="text-gray-600 mt-2 font-semibold">
                Processing Errors
              </p>
            </div>

            <div className="mt-4 rounded-lg bg-red-50 p-3">
              <p className="text-center text-sm text-red-700">
                Flawless performance with zero errors
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientsCountSection;
