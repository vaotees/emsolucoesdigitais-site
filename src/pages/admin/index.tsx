import AdminLayout from "../../components/AdminLayout"
import { useEffect, useState } from "react"

interface Feature {
  id: string
  title: string
  description: string
  icon: string
}

interface Testimonial {
  id: string
}

export default function AdminDashboard() {
  const [features, setFeatures] = useState<Feature[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/features").then(r => r.json()),
      fetch("/api/testimonials").then(r => r.json())
    ])
      .then(([featData, testData]) => {
        setFeatures(Array.isArray(featData) ? featData : [])
        setTestimonials(Array.isArray(testData) ? testData : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Visão Geral</h1>
            <p className="text-white/60">Gerencie o conteúdo da sua Landing Page.</p>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
            <h3 className="text-white/60 mb-2 font-medium">Serviços Cadastrados</h3>
            <p className="text-4xl font-bold text-white">{features.length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
            <h3 className="text-white/60 mb-2 font-medium">Depoimentos</h3>
            <p className="text-4xl font-bold text-white">{testimonials.length}</p>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Últimos Serviços</h2>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-white/50">Carregando dados...</div>
            ) : features.length === 0 ? (
              <div className="p-8 text-center text-white/50">Nenhum serviço cadastrado.</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-white/70 font-medium">Título</th>
                    <th className="px-6 py-4 text-white/70 font-medium">Ícone</th>
                    <th className="px-6 py-4 text-white/70 font-medium hidden md:table-cell">Descrição</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {features.map((feature) => (
                    <tr key={feature.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{feature.title}</td>
                      <td className="px-6 py-4 text-white/70">{feature.icon}</td>
                      <td className="px-6 py-4 text-white/60 truncate max-w-xs hidden md:table-cell">
                        {feature.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}
