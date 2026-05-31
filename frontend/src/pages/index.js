import Layout from '../components/Layout';
import Link from 'next/link';

export default function Home() {
  return (
    <Layout>
      <section className="bg-gradient-to-br from-school-primary to-school-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to SchoolName</h1>
          <p className="text-xl mb-8 text-school-light">Empowering students with quality education and holistic development</p>
          <div className="flex justify-center space-x-4">
            <Link href="/admissions" className="bg-white text-school-primary px-8 py-3 rounded-lg font-semibold hover:bg-school-light transition">
              Apply Now
            </Link>
            <Link href="/about" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-school-primary transition">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '📚', title: 'Quality Education', desc: 'Experienced teachers and modern curriculum for academic excellence.' },
            { icon: '🏆', title: 'Holistic Development', desc: 'Sports, arts, and extracurricular activities for overall growth.' },
            { icon: '🔬', title: 'Modern Facilities', desc: 'Well-equipped labs, library, and smart classrooms for better learning.' },
          ].map((item, i) => (
            <div key={i} className="card text-center hover:shadow-lg transition">
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-school-light py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">School Highlights</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: '500+', label: 'Students' },
              { number: '40+', label: 'Teachers' },
              { number: '98%', label: 'Pass Rate' },
              { number: '15+', label: 'Years Legacy' },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-4xl font-bold text-school-primary">{item.number}</div>
                <div className="text-gray-600 mt-2">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
