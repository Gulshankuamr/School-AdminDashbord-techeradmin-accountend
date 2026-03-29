import React, { useEffect, useState } from 'react'
import { Search, GraduationCap, AlertCircle, RefreshCw } from 'lucide-react'
import { classService } from '../../services/classService/classService'
import { sectionService } from '../../services/sectionService/sectionService'
import { toast } from 'sonner'
import ClassRow from './ClassRow'

function ClassSectionManager() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [search, setSearch]   = useState('')

  const fetchAll = async () => {
    try {
      setLoading(true); setError(null)
      const classRes  = await classService.getAllClasses()
      const classList = classRes.data || []

      const withSections = await Promise.all(
        classList.map(async (cls) => {
          try {
            const secRes   = await sectionService.getAllSections(cls.class_id)
            const sections = Array.isArray(secRes.data) ? secRes.data : []
            return { ...cls, sections }
          } catch {
            return { ...cls, sections: [] }
          }
        })
      )
      setClasses(withSections)
    } catch (err) {
      setError(err.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const filtered = classes.filter(c => {
    const q = search.toLowerCase()
    return c.class_name?.toLowerCase().includes(q) || c.class_code?.toString().toLowerCase().includes(q)
  })

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center font-sans">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-400">Loading classes & sections...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-[60vh] flex items-center justify-center font-sans">
      <div className="bg-white rounded-2xl p-8 text-center max-w-xs border border-slate-200 shadow-sm">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-800 mb-1">Something went wrong</p>
        <p className="text-xs text-slate-400 mb-4">{error}</p>
        <button onClick={fetchAll} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-5 py-7 font-sans">
      <div className="mb-5">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Classes & Sections</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your school's classes and their sections</p>
      </div>

      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 mb-4 shadow-sm">
        <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <input type="text" placeholder="Search classes..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 border-none bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 py-1" />
        {search && (
          <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 text-base px-1">×</button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-2xl border border-slate-200">
          <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700 mb-1">{search ? 'No classes found' : 'No classes yet'}</p>
          <p className="text-xs text-slate-400">{search ? 'Try a different search.' : 'No classes available.'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((cls, idx) => (
            <div key={cls.class_id} className="animate-fadeUp" style={{ animationDelay: `${idx * 35}ms`, animationFillMode: 'both' }}>
              <ClassRow
                classItem={cls}
                defaultOpen={cls.sections?.length > 0}
                // Only class-level callbacks — NO section callbacks
                // Sections are 100% managed inside ClassRow
                // Passing section callbacks here was the root cause of duplicates & add-not-showing
                onClassUpdated={(updated) => {
                  setClasses(prev => prev.map(c =>
                    c.class_id === updated.class_id ? { ...c, class_name: updated.class_name } : c
                  ))
                }}
                onClassDeleted={(classId) => {
                  setClasses(prev => prev.filter(c => c.class_id !== classId))
                }}
              />
            </div>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-center mt-4 text-xs font-bold text-slate-300 uppercase tracking-widest">
          {filtered.length} of {classes.length} class{classes.length !== 1 ? 'es' : ''} shown
        </p>
      )}
    </div>
  )
}

export default ClassSectionManager