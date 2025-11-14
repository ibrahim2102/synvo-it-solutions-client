import React from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const slides = [
	{
		img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
		title: 'Expert IT Services',
		details: 'End-to-end solutions for your business: consulting, implementation, and support.',
	},
	{
		img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop',
		title: 'Managed Cloud',
		details: 'Secure, scalable cloud infrastructure tailored to your growth.',
	},
	{
		img: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?q=80&w=1200&auto=format&fit=crop',
		title: 'Custom Development',
		details: 'Build products faster with our experienced engineering teams.',
	},
];

const Slider = () => {
	// Animation variants for slide content
	const contentVariants = {
		hidden: { opacity: 0, x: -50 },
		visible: {
			opacity: 1,
			x: 0,
			transition: {
				duration: 0.6,
				staggerChildren: 0.2,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.4 },
		},
	};

	return (
		<motion.div
			className="w-full"
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.5 }}
		>
			<Swiper
				modules={[Navigation, Pagination, Autoplay, A11y]}
				spaceBetween={24}
				slidesPerView={1}
				loop
				autoplay={{ delay: 3500, disableOnInteraction: false }}
				pagination={{ clickable: true }}
				navigation
				className="rounded-xl overflow-hidden"
			>
				{slides.map((s, i) => (
					<SwiperSlide key={i}>
						<div className="relative w-full">
							<motion.img
								src={s.img}
								alt={s.title}
								className="w-full h-80 md:h-[460px] object-cover"
								initial={{ scale: 1.1 }}
								whileInView={{ scale: 1 }}
								viewport={{ once: true }}
								transition={{ duration: 0.8 }}
							/>
							<div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/30 to-transparent" />
							<motion.div
								className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 text-white space-y-3 md:space-y-4 max-w-lg"
								variants={contentVariants}
								initial="hidden"
								whileInView="visible"
								viewport={{ once: true }}
							>
								<motion.h2
									className="text-2xl md:text-4xl font-bold"
									variants={itemVariants}
								>
									{s.title}
								</motion.h2>
								<motion.p
									className="text-sm md:text-base opacity-90"
									variants={itemVariants}
								>
									{s.details}
								</motion.p>
								<motion.div variants={itemVariants}>
									<Link
										to="/services"
										className="btn btn-primary btn-sm md:btn-md"
									>
										Explore
									</Link>
								</motion.div>
							</motion.div>
						</div>
					</SwiperSlide>
				))}
			</Swiper>
		</motion.div>
	);
};

export default Slider;