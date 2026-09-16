import React from 'react';

const VideoSection: React.FC = () => {
  const handleBookDemoClick = () => {
    const section = document.getElementById('book-demo');
    if (section) {
      section.scrollIntoView({behavior: 'smooth', block: 'center'});
    }
  };

  return (
    <section className="from-gray-50 bg-gradient-to-br to-white px-4 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Video Container */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-20 blur-lg"></div>
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <div className="absolute inset-0 z-10 rounded-2xl bg-gradient-to-t from-black/20 to-transparent"></div>
              p
              <div className="absolute bottom-4 left-4 z-20">
                <div className="flex items-center">
                  <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <span className="rounded-full bg-black/30 px-3 py-1 text-sm font-medium text-white">
                    Watch demo
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:pl-8">
            {/* Title */}
            <h2 className="text-gray-900 font-poppins mb-8 text-4xl font-semibold md:text-3xl">
              Catering made effortless,
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Menubook
              </span>{' '}
              made intelligent
            </h2>

            {/* Description box */}
            <div className="border-gray-100 relative mb-10 rounded-xl border bg-white p-8 shadow-lg">
              <div className="absolute left-0 top-0 h-full w-2 rounded-l-xl bg-gradient-to-b from-blue-500 to-purple-500"></div>
              <div className="pl-6">
                <p className="text-gray-700 font-dmsans text-lg leading-relaxed">
                  "Join us on a seamless journey with Menubook – the all-in-one
                  catering software. From event scheduling and menu planning to
                  reports and billing, manage everything effortlessly at your
                  fingertips. Save time, simplify operations, and grow your
                  catering business with ease. Watch the demo and step into the
                  future of catering management."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
