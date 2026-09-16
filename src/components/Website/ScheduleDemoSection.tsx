import {DemoImage} from '@/assets/images/webImages';
import React from 'react';

const ScheduleDemoSection = () => {
  return (
    <section
      id="book-demo"
      className="schedule cursor-default px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
            Experience Menubook in Action
          </h2>
          <p className="text-gray-600 mx-auto mt-4 max-w-2xl text-lg">
            See how our platform can transform your restaurant operations
          </p>
        </div>

        <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="flex flex-col md:flex-row">
            <div className="flex w-full flex-col justify-center bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white md:w-2/5">
              <div className="mb-8">
                <h3 className="mb-4 text-2xl font-bold md:text-3xl">
                  Schedule a personalized demo
                </h3>
                <p className="opacity-90">
                  Get in touch with our experts to see how Menubook can
                  streamline your operations and boost profitability.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-start">
                  <div className="mr-4 rounded-lg bg-white/20 p-2">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold">No obligation</h4>
                    <p className="text-sm opacity-80">
                      Free consultation with our experts
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="mr-4 rounded-lg bg-white/20 p-2">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold">30 minutes</h4>
                    <p className="text-sm opacity-80">
                      Quick but comprehensive walkthrough
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="mr-4 rounded-lg bg-white/20 p-2">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold">Tailored to you</h4>
                    <p className="text-sm opacity-80">
                      See features that matter to your business
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full p-8 md:w-3/5 md:p-12">
              <form className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="text-gray-700 mb-1 block text-sm font-medium"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="border-gray-300 w-full rounded-lg border px-4 py-3 transition-colors duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="text-gray-700 mb-1 block text-sm font-medium"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      className="border-gray-300 w-full rounded-lg border px-4 py-3 transition-colors duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      placeholder="Your phone number"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="email"
                      className="text-gray-700 mb-1 block text-sm font-medium"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="border-gray-300 w-full rounded-lg border px-4 py-3 transition-colors duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      placeholder="Your email address"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="city"
                      className="text-gray-700 mb-1 block text-sm font-medium"
                    >
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      className="border-gray-300 w-full rounded-lg border px-4 py-3 transition-colors duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      placeholder="Your city"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="restaurant"
                    className="text-gray-700 mb-1 block text-sm font-medium"
                  >
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    id="restaurant"
                    className="border-gray-300 w-full rounded-lg border px-4 py-3 transition-colors duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    placeholder="Your restaurant name"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full transform rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-medium text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
                >
                  Schedule My Free Demo
                </button>

                <p className="text-gray-500 mt-4 text-center text-sm">
                  We respect your privacy. Your information will be used to
                  schedule your demo and you may receive other communications
                  from Menubook.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScheduleDemoSection;
