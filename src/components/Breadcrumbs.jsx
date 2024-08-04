import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiChevronRight } from 'react-icons/hi';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-2 md:space-x-3">
        <motion.li
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center"
        >
          <Link
            to="/"
            className="text-base-content hover:text-primary transition-colors duration-200 font-medium"
          >
            Home
          </Link>
        </motion.li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          return (
            <motion.li
              key={to}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-center">
                <HiChevronRight className="w-5 h-5 text-base-content/50" />
                <Link
                  to={to}
                  className={`ml-1 md:ml-2 text-sm md:text-base font-medium ${
                    isLast
                      ? 'text-primary pointer-events-none'
                      : 'text-base-content hover:text-primary transition-colors duration-200'
                  }`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </Link>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;