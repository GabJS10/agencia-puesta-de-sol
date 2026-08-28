"use client";

import { motion } from "framer-motion";
import { Eyebrow } from "@/components/ui/Eyebrow";

interface Props {
  description: string;
  stats: {
    value: string;
    label: string;
  }[];
}

export function About({ description, stats }: Props) {
  return (
    <section className="bg-surface py-20 px-6 md:px-12 border-t border-foreground/5">
      <div className="max-w-480 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Eyebrow className="mb-6">Sobre Nosotros</Eyebrow>
          <p className="font-display text-2xl md:text-3xl lg:text-[2rem] font-normal text-foreground leading-snug max-w-480">
            {description}{" "}
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
              <span className="font-display text-4xl md:text-5xl font-semibold text-atardecer">
                {stat.value}
              </span>
              <span className="text-muted text-sm tracking-wide uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
