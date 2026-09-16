import React from 'react';
import logo2 from '../../assets/images/logo/logo2.png';
import logo3 from '../../assets/images/logo/logo3.png';
import logo4 from '../../assets/images/logo/logo4.png';
import logo5 from '../../assets/images/logo/logo5.jpg';

const brandLogos = [
  {src: logo2, alt: 'Haldirams'},
  {src: logo3, alt: 'Zepto'},
  {src: logo4, alt: 'Bira'},
  {src: logo5, alt: 'L&T Realty'},
  {
    src: 'https://petpoojaweb.gumlet.io/images/home-new/la_pinoz_pizza_logo.webp',
    alt: 'La Pinoz Pizza',
  },
  {
    src: 'https://petpoojaweb.gumlet.io/images/ice-cream-and-dessert/apsara.webp',
    alt: 'Apsara',
  },
  {
    src: 'https://petpoojaweb.gumlet.io/images/fine-dine/Hocco.webp',
    alt: 'Hocco',
  },
];

const BrandListSection = () => {
  return (
    <div className="from-gray-50 bg-gradient-to-b to-white px-4 py-16">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-12 text-center">
          <h2 className="text-gray-900 mb-6 text-3xl font-bold md:text-4xl">
            Trusted by <span className="text-blue-800">10,000+</span> Businesses
            Across India
          </h2>
          <p className="text-gray-600 mx-auto max-w-2xl">
            Join the growing community of successful restaurants and businesses
            that rely on our platform
          </p>
        </div>

        {/* Logo slider container */}
        <div className="relative overflow-hidden">
          {/* Gradient fade effects */}
          <div className="absolute bottom-0 left-0 top-0 z-10 w-20 bg-gradient-to-r from-white to-transparent"></div>
          <div className="absolute bottom-0 right-0 top-0 z-10 w-20 bg-gradient-to-l from-white to-transparent"></div>

          {/* Logo slider */}
          <div className="flex gap-12 py-4">
            {/* First set of logos */}
            {brandLogos.map((logo, index) => (
              <div
                key={index}
                className="group flex flex-shrink-0 items-center justify-center"
              >
                <div className="rounded-xl bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md group-hover:-translate-y-1">
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="h-12 w-auto object-contain opacity-80 transition-opacity duration-300 group-hover:opacity-100 sm:h-16 md:h-20"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}

            {/* Duplicate logos for infinite effect */}
            {brandLogos.map((logo, index) => (
              <div
                key={`dup-${index}`}
                className="group flex flex-shrink-0 items-center justify-center"
              >
                <div className="rounded-xl bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md group-hover:-translate-y-1">
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="h-12 w-auto object-contain opacity-80 transition-opacity duration-300 group-hover:opacity-100 sm:h-16 md:h-20"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandListSection;
