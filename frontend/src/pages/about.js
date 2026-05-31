import Layout from '../components/Layout';
import { TargetIcon, GlobeIcon, HeartIcon, LightbulbIcon } from '../components/Icons';

const iconMap = {
  mission: TargetIcon,
  vision: GlobeIcon,
  values: HeartIcon,
  approach: LightbulbIcon,
};

const aboutItems = [
  { key: 'mission', title: 'Our Mission', desc: 'To provide quality education that develops intellectual curiosity, critical thinking, and strong moral values — empowering every student to reach their full potential.' },
  { key: 'vision', title: 'Our Vision', desc: 'To be a leading international school that produces responsible, innovative, and compassionate global citizens ready to make a positive impact.' },
  { key: 'values', title: 'Our Values', desc: 'Integrity, Excellence, Innovation, Respect, and Community Service form the core of our educational philosophy — reflected in our crest and motto.' },
  { key: 'approach', title: 'Our Approach', desc: 'We blend time-tested values with modern teaching methods, creating a dynamic, inclusive, and engaging learning environment for every child.' },
];

const mottoItems = [
  { word: 'LEARN', desc: 'Knowledge is the foundation of every great achievement.' },
  { word: 'LEAD', desc: 'We develop leaders who inspire and serve others.' },
  { word: 'ACHIEVE', desc: 'Excellence is the standard we hold for every student.' },
];

export default function About() {
  return (
    <Layout>
      <section className="bg-gradient-to-br from-school-primary to-school-dark text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-school-accent font-semibold uppercase tracking-widest text-sm mb-2">Who We Are</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Genesis International</h1>
          <p className="text-gray-300 text-lg italic">Learn · Lead · Achieve</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <p className="text-lg text-gray-600 mb-10 leading-relaxed text-center">
          Genesis International School has been a beacon of educational excellence for over two decades.
          We are committed to nurturing young minds, building strong character, and preparing students
          to lead with confidence in an ever-changing world.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {aboutItems.map((item) => {
            const Icon = iconMap[item.key];
            return (
              <div key={item.key} className="card hover:shadow-lg transition">
                <div className="text-school-primary mb-3"><Icon /></div>
                <h3 className="text-xl font-semibold text-school-primary mb-2">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-school-primary rounded-2xl p-10 text-white text-center">
          <h2 className="text-2xl font-bold mb-6">Our Motto</h2>
          <div className="flex justify-center gap-12 flex-wrap">
            {mottoItems.map((item) => (
              <div key={item.word} className="max-w-xs">
                <div className="text-school-accent font-bold text-xl mb-1">{item.word}</div>
                <p className="text-gray-300 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
