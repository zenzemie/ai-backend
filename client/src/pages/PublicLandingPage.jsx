import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, CheckCircle2, ChevronRight, Loader2, Globe } from 'lucide-react';

const PublicLandingPage = () => {
  const { slug } = useParams();
  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking fetch
    setTimeout(() => {
      setWebsite({
        title: 'Gusto Italiano',
        content: {
          hero: {
            headline: 'The Most Authentic Italian Experience in London',
            subheadline: 'Hand-crafted pasta, wood-fired pizza, and an atmosphere that transports you to the heart of Rome.',
            ctaText: 'Book via WhatsApp'
          },
          gap: {
            problem: 'Tired of complicated booking systems and long wait times?',
            solution: 'Our AI-powered WhatsApp assistant handles your reservations 24/7. Just one message and you\'re in.'
          },
          services: [
            { title: 'Fine Dining', description: 'Experience our full a la carte menu in our premium dining room.', price: 'From £45' },
            { title: 'Wood-Fired Pizza', description: 'Authentic Neapolitan pizza made with imported ingredients.', price: 'From £14' },
            { title: 'Private Events', description: 'Host your special occasions in our exclusive private lounge.', price: 'Enquire' }
          ],
          faq: [
            { question: 'Do you offer vegan options?', answer: 'Yes! We have a dedicated vegan menu featuring plant-based pastas and pizzas.' },
            { question: 'Is there a dress code?', answer: 'We maintain a smart-casual dress code to ensure a premium atmosphere for all guests.' }
          ],
          theme: {
            primaryColor: '#f59e0b',
            accentColor: '#10b981'
          },
          whatsapp: {
            phoneNumber: '447000000000',
            prefilledMessage: "Hi! I'd like to book a table at Gusto Italiano."
          }
        }
      });
      setLoading(false);
    }, 1500);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-6">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 bg-zinc-800 rounded-3xl flex items-center justify-center text-zinc-500"
        >
          <Globe size={32} />
        </motion.div>
        <p className="text-zinc-500 font-medium tracking-widest text-xs uppercase">Loading Experience</p>
      </div>
    );
  }

  const { content } = website;

  return (
    <div className="bg-zinc-950 text-white min-h-screen font-sans selection:bg-amber-500/30">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center p-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-zinc-950/60"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-5xl"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold uppercase tracking-widest text-zinc-400 mb-8">
            Experience Elite Dining
          </span>
          <h1 className="text-5xl md:text-8xl font-black leading-tight tracking-tighter">
            {content.hero.headline}
          </h1>
          <p className="text-zinc-400 text-lg md:text-2xl mt-8 max-w-2xl mx-auto leading-relaxed">
            {content.hero.subheadline}
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href={`https://wa.me/${content.whatsapp.phoneNumber}?text=${encodeURIComponent(content.whatsapp.prefilledMessage)}`}
              style={{ backgroundColor: content.theme.primaryColor }}
              className="group relative flex items-center gap-3 px-10 py-5 rounded-full font-black text-xl text-white shadow-2xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <MessageCircle size={24} className="fill-white/20" />
              {content.hero.ctaText}
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </motion.div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Scroll to Explore</span>
          <div className="w-px h-12 bg-gradient-to-b from-white to-transparent"></div>
        </div>
      </section>

      {/* The Gap Section */}
      <section className="py-32 px-6 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-12 italic">{content.gap.problem}</h2>
          <div className="p-8 md:p-12 rounded-3xl bg-zinc-950 border border-zinc-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CheckCircle2 size={120} />
            </div>
            <p className="text-xl md:text-3xl font-medium leading-relaxed relative z-10">
              {content.gap.solution}
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <span className="text-amber-500 font-bold uppercase tracking-widest text-sm">Our Offerings</span>
            <h2 className="text-4xl md:text-6xl font-bold mt-4">Curated Experiences</h2>
          </div>
          <p className="text-zinc-500 max-w-md text-lg">
            We've perfected the art of service to bring you something truly remarkable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {content.services.map((service, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="text-amber-500" size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
              <p className="text-zinc-500 mb-8 leading-relaxed">{service.description}</p>
              <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
                <span className="font-bold text-lg">{service.price}</span>
                <button className="text-amber-500 font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Book Now <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-6 bg-zinc-900/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-16 text-center">Frequently Asked</h2>
          <div className="space-y-6">
            {content.faq.map((item, i) => (
              <div key={i} className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800">
                <h4 className="text-xl font-bold mb-4">{item.question}</h4>
                <p className="text-zinc-500 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-900 px-6 text-center">
        <p className="text-zinc-600 text-sm">
          &copy; {new Date().getFullYear()} {website.title}. Powered by LeadForge AI.
        </p>
      </footer>

      {/* Floating WhatsApp Button */}
      <a 
        href={`https://wa.me/${content.whatsapp.phoneNumber}?text=${encodeURIComponent(content.whatsapp.prefilledMessage)}`}
        className="fixed bottom-8 right-8 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group"
      >
        <MessageCircle size={28} className="fill-white" />
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-black px-4 py-2 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
          Chat with us!
        </span>
      </a>
    </div>
  );
};

export default PublicLandingPage;
