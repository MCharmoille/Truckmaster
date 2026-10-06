import { useRef, useState } from 'react'
import { api } from '../api.js'
import { aujourdhui } from '../date.js'

const AucunJour = ({ onCree }) => {
  const [enCours, setEnCours] = useState(false)
  const verrou = useRef(false)

  const creer = async () => {
    if (verrou.current) return
    verrou.current = true
    setEnCours(true)
    try {
      await api.post('dates/addDate', { jour: aujourdhui(), cb_midi: 1, cb_soir: 1 })
      onCree()
    } catch (error) {
      console.error(error)
      alert("Le jour n'a pas pu être créé. Réessayez.")
      verrou.current = false
      setEnCours(false)
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-slate-800/50 border border-slate-700 rounded-3xl p-8 text-center">
      <p className="text-xl font-bold mb-6">Aucun jour travaillé.</p>
      <button
        type="button"
        onClick={creer}
        disabled={enCours}
        className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-lg font-bold"
      >
        Créer aujourd'hui
      </button>
    </div>
  )
}

export default AucunJour
