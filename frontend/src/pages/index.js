import Layout from '../components/Layout';
import Link from 'next/link';
import { BookIcon, TrophyIcon, FlaskIcon } from '../components/Icons';

export default function Home() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-school-primary to-school-dark text-white py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-school-accent font-semibold uppercase tracking-widest text-sm mb-3">Welcome to</p>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">Genesis International School</h1>
          <p className="text-xl mb-2 text-gray-300 italic">Learn · Lead · Achieve</p>
          <p className="text-lg mb-10 text-gray-300 max-w-2xl mx-auto">
            Nurturing young minds with quality education, strong values, and a vision for a better tomorrow.
          </p>
          <div className="flex justify-center flex-wrap gap-4">
            <Link href="/admissions" className="bg-school-accent text-school-dark px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition">
              Apply Now
            </Link>
            <Link href="/about" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-school-primary transition">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2">Why Choose Genesis International?</h2>
        <p className="text-center text-gray-500 mb-12">A school that shapes character as much as it builds knowledge.</p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: BookIcon, title: 'Academic Excellence', desc: 'Experienced educators and a rigorous curriculum designed to bring out the best in every student.' },
            { icon: TrophyIcon, title: 'Holistic Development', desc: 'Sports, arts, leadership programs, and extracurriculars that develop well-rounded individuals.' },
            { icon: FlaskIcon, title: 'Modern Facilities', desc: 'Smart classrooms, well-equipped science labs, a rich library, and a safe, inspiring campus.' },
          ].map((item, i) => (
            <div key={i} className="card text-center hover:shadow-lg transition">
              <div className="text-school-primary mb-4 flex justify-center"><item.icon /></div>
              <h3 className="text-xl font-semibold mb-2 text-school-primary">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-school-primary py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Genesis by the Numbers</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: '1,200+', label: 'Students Enrolled' },
              { number: '80+', label: 'Qualified Teachers' },
              { number: '99%', label: 'Pass Rate' },
              { number: '20+', label: 'Years of Excellence' },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-4xl font-bold text-school-accent">{item.number}</div>
                <div className="text-gray-200 mt-2">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Join the Genesis Family?</h2>
        <p className="text-gray-600 mb-8 max-w-xl mx-auto">
          Admissions are open for the upcoming academic year. Take the first step towards a brighter future.
        </p>
        <Link href="/admissions" className="bg-school-primary text-white px-10 py-3 rounded-lg font-semibold hover:bg-school-secondary transition">
          Start Your Application
        </Link>
      </section>
    </Layout>
  );
}
