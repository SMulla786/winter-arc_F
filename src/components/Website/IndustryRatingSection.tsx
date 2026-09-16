import {
  CapterraRatings,
  GoogleRatings,
  SoftwareSuggestRatings,
} from '@/assets/images/webImages';
import React from 'react';

const IndustryRatingSection = () => {
  return (
    <section className="industry-ratings from-gray-50 cursor-default bg-gradient-to-b to-white px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h3 className="text-gray-900 mb-4 text-3xl font-bold md:text-4xl">
            Trusted by Restaurants Everywhere
          </h3>
          <p className="text-gray-600 mx-auto max-w-2xl">
            Industry leaders recognize our commitment to excellence in
            restaurant management solutions
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
          {/* Capterra Card */}
          <div className="transform rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
            </div>

            <a
              href="https://www.capterra.com/p/172163/Petpooja-Restaurant-Management-Platform/reviews/"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="mb-4 flex justify-center">
                {/* <img
                  loading="lazy"
                  className="h-8"
                  src={CapterraRatings}
                  alt="Capterra Ratings"
                /> */}
                <h1>Capterra</h1>
              </div>

              <p className="text-gray-700 mt-4 text-center text-sm font-medium leading-relaxed">
                Reviews voted us as the value-for-money billing solution
              </p>

              <div className="mt-6 flex justify-center">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                  Read reviews
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </span>
              </div>
            </a>
          </div>

          {/* SoftwareSuggest Card */}
          <div className="transform rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
            </div>

            <a
              href="https://www.softwaresuggest.com/petpooja"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="mb-4 flex justify-center">
                {/* <img
                  loading="lazy"
                  className="h-8"
                  src={SoftwareSuggestRatings}
                  alt="Software Suggest Ratings"
                /> */}
                <h1>Software Suggest</h1>
              </div>

              <p className="text-gray-700 mt-4 text-center text-sm font-medium leading-relaxed">
                Rated as the most user-friendly restaurant POS
              </p>

              <div className="mt-6 flex justify-center">
                <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                  Read reviews
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </span>
              </div>
            </a>
          </div>

          {/* Google Card */}
          <div className="transform rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
            </div>

            <a
              href="https://www.google.com/search?q=petpooja&amp;rlz=1C1FKPE_enIN990IN990&amp;oq=Petpoo&amp;aqs=chrome.3.69i60j69i59l3j69i57j69i60l3.3240j0j7&amp;sourceid=chrome&amp;ie=UTF-8"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="mb-4 flex justify-center">
                {/* <img
                  loading="lazy"
                  className="h-8"
                  src={GoogleRatings}
                  alt="Google Ratings"
                /> */}
                <h1>Google</h1>
              </div>

              <p className="text-gray-700 mt-4 text-center text-sm font-medium leading-relaxed">
                Restaurateurs rated us the most recommended POS provider
              </p>

              <div className="mt-6 flex justify-center">
                <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                  Read reviews
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IndustryRatingSection;
