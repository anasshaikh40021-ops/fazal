import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsLetterBox from '../components/NewsLetterBox'

const About = () => {
  return (
    <div>

      <div className='text-2xl text-center pt-8 border-t'>
        <Title text1={'ABOUT'} text2={'US'}/>
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img className='w-full md:max-w-[450px]' src={assets.about_img} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
          <p>We are a modern fashion brand dedicated to bringing you stylish, high-quality clothing at affordable prices. Our collections are designed to keep you comfortable while helping you express your unique style.From everyday essentials to trend-driven pieces, we carefully curate our products to meet the needs of today’s lifestyle. Quality, comfort, and attention to detail are at the heart of everything we create.</p>
          <p>We believe fashion should be accessible to everyone. That’s why we focus on offering reliable service, fast delivery, and a seamless shopping experience.Thank you for choosing us as part of your style journey.</p>
          <b className='text-gray-800'>Our Mission</b>
          <p>Fashion is more than just clothing—it’s a way to express your personality and lifestyle. Our vision is to empower individuals to feel confident, stylish, and inspired every day through our thoughtfully designed products</p>
        </div>

      </div>
      <div className='text-xl py-4'>
        <Title text1={'WHY'} text2={'CHOOSE US'}/>

      </div>
      <div className='flex flex-col md:flex-row text-sm mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Quality Assurance:</b>
          <p className='text-gray-600'>We are committed to sustainable practices and ethical production. Our products are made to last, using responsibly sourced materials, so you can enjoy fashion that looks good and feels good.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Convenience:</b>
          <p className='text-gray-600'>We bring you stylish, high-quality clothing designed for everyday life. From casual wear to trend-driven pieces, our collections combine comfort, quality, and style.Shop with confidence—fast delivery, easy returns, and customer satisfaction are always our priority.Fashion made simple, so you can look good and feel great every day.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Exceptional Customer Service:</b>
          <p className='text-gray-600'>Your satisfaction is our top priority. We strive to provide a seamless shopping experience with easy navigation, fast delivery, and responsive customer service. We believe shopping for clothes should be exciting, effortless, and enjoyable..</p>
        </div>
        

      </div>

      <NewsLetterBox/>

      
    </div>
  )
}

export default About
