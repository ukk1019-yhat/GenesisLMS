import Layout from '../components/Layout';

export default function About() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-6">About Our School</h1>
        <div className="prose max-w-none">
          <p className="text-lg text-gray-600 mb-6">
            SchoolName has been a beacon of educational excellence for over a decade. We are committed to nurturing young minds and preparing them for the challenges of tomorrow.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {[
            { title: 'Our Mission', desc: 'To provide quality education that develops intellectual curiosity, critical thinking, and moral values in students.' },
            { title: 'Our Vision', desc: 'To be a leading educational institution that produces responsible, innovative, and compassionate global citizens.' },
            { title: 'Our Values', desc: 'Integrity, Excellence, Innovation, Respect, and Community service form the core of our educational philosophy.' },
            { title: 'Our Approach', desc: 'We blend traditional values with modern teaching methods to create a dynamic and engaging learning environment.' },
          ].map((item, i) => (
            <div key={i} className="card">
              <h3 className="text-xl font-semibold text-school-primary mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
