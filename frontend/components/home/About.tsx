"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "200+", label: "Happy Customers" },
  { value: "65+", label: "Top Hotels" },
  { value: "250+", label: "Experienced Guides" },
];

export function About() {
  return (
    <section className="bg-white py-20 px-6 md:px-12">
      <div className="max-w-480 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Side: Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[#00B4D8] text-sm font-medium tracking-widest uppercase mb-6 block">
            About Us
          </span>
          <p className="text-lg md:text-xl lg:text-2xl font-normal text-black leading-tight max-w-480">
            We are a passionate team of travel enthusiasts dedicated to making
            your travel dreams come true.{" "}
          </p>
        </motion.div>

        {/* Right Side: Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap gap-12 lg:justify-end"
        >
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col gap-2">
              <span className="text-xl md:text-2xl font-medium text-black">
                {stat.value}
              </span>
              <span className="text-gray-500 text-sm tracking-wide">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
