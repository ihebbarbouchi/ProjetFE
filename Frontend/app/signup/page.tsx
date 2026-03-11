'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PublicLayout } from '../components/PublicLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { AlertCircle, CheckCircle, Upload, ArrowLeft, Eye, EyeOff, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type AccountType = 'Apprenant' | 'Enseignant' | '';

export default function SignUp() {
  const router = useRouter();
  const { signup } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState<1 | 2 | 'success'>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Step 1
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('');
  const [isAccountTypeOpen, setIsAccountTypeOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Step 2
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [position, setPosition] = useState('');
  const [institution, setInstitution] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [letterFile, setLetterFile] = useState<File | null>(null);
  const [cinFile, setCinFile] = useState<File | null>(null);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas !');
      return;
    }
    if (!acceptTerms) {
      alert('Veuillez accepter les conditions générales.');
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validation des fichiers obligatoires pour les enseignants
    if (accountType === 'Enseignant') {
      if (!cvFile || !letterFile || !cinFile) {
        setError('Le CV, la Lettre de motivation et le CIN sont obligatoires pour les enseignants.');
        setIsSubmitting(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    try {
      // Préparation du FormData pour l'envoi de fichiers
      const formData = new FormData();
      formData.append('prenom', firstName);
      formData.append('nom_famille', lastName);
      formData.append('email', email);
      formData.append('mot_de_passe', password);
      formData.append('role', accountType === 'Apprenant' ? 'student' : 'teacher');
      formData.append('telephone', phone);
      formData.append('adresse', address);
      formData.append('ville', city);
      formData.append('pays', country);
      formData.append('poste_actuel', position);
      formData.append('institution', institution);

      if (cvFile) formData.append('cv', cvFile);
      if (letterFile) formData.append('motivation', letterFile);
      if (cinFile) formData.append('cin', cinFile);

      // Appel de l'API via le fetch direct car signup dans AuthContext ne gère pas FormData
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'inscription');
      }

      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'inscription.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void
  ) => {
    if (e.target.files && e.target.files[0]) setter(e.target.files[0]);
  };

  return (
    <PublicLayout>
      {/* Full-page gradient section */}
      <section className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 flex items-center">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* ── Left panel: text only ─────────────────────────────────── */}
            <div className="hidden lg:flex flex-col justify-between h-full py-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full">
                  EduShare
                </div>
                <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                  Rejoignez une communauté éducative innovante
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed max-w-md">
                  Partagez des ressources pédagogiques, créez des quiz interactifs et
                  collaborez avec des enseignants et étudiants du monde entier.
                </p>

                {/* Feature bullets */}
                <ul className="space-y-3 pt-2">
                  {[
                    'Accès à des milliers de ressources pédagogiques',
                    'Quiz interactifs et suivi de progression',
                    'Collaboration enseignant-étudiant simplifiée',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-gray-700">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>


            </div>

            {/* ── Right panel: white card form ──────────────────────────── */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">

              {/* Progress bar */}
              {step !== 'success' && (
                <div className="flex items-center gap-3 mb-8">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${step === 1 ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
                    1
                  </div>
                  <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden">
                    <div className={`h-full bg-blue-600 rounded-full transition-all duration-500 ${step === 2 ? 'w-full' : 'w-0'}`} />
                  </div>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    2
                  </div>
                </div>
              )}

              {/* ── STEP 1 ─────────────────────────────────────────────── */}
              {step === 1 && (
                <>
                  <div className="mb-7">
                    <h2 className="text-2xl font-bold text-gray-900">Créer un compte</h2>
                    <p className="text-sm text-gray-500 mt-1">Votre espace EduShare</p>
                  </div>

                  <form onSubmit={handleStep1Submit} className="space-y-4">
                    {/* Nom + Prénom */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Nom</Label>
                        <Input
                          id="lastName"
                          placeholder="Dupont"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">Prénom</Label>
                        <Input
                          id="firstName"
                          placeholder="Jean"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    {/* Type de compte */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700">Type de compte</Label>
                      <div
                        onClick={() => setIsAccountTypeOpen(!isAccountTypeOpen)}
                        className={`h-11 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between px-4 cursor-pointer transition-all hover:bg-gray-100 ${isAccountTypeOpen ? 'ring-2 ring-blue-100 border-blue-500' : ''}`}
                      >
                        <span className={accountType ? "text-gray-900 font-medium" : "text-gray-400"}>
                          {accountType === 'Apprenant' && "🎓 Apprenant"}
                          {accountType === 'Enseignant' && "👨‍🏫 Enseignant"}
                          {!accountType && "Sélectionnez votre profil"}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isAccountTypeOpen ? 'rotate-180' : ''}`} />
                      </div>

                      {isAccountTypeOpen && (
                        <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                          <div
                            className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 transition-colors border-b border-gray-50"
                            onClick={() => { setAccountType('Apprenant'); setIsAccountTypeOpen(false); }}
                          >
                            🎓 Apprenant
                          </div>
                          <div
                            className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 transition-colors"
                            onClick={() => { setAccountType('Enseignant'); setIsAccountTypeOpen(false); }}
                          >
                            👨‍🏫 Enseignant
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email {accountType && `${accountType}`}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="jean.dupont@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white transition-colors"
                      />
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700">Mot de passe</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={8}
                          className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white transition-colors pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400">Utilisez 8 caractères minimum avec un mélange de lettres, chiffres et symboles.</p>
                    </div>

                    {/* Repeat Password */}
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">confirm mot de passe</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white transition-colors pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          tabIndex={-1}
                        >
                          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Terms checkbox */}
                    <div className="flex items-center gap-2.5 pt-1">
                      <Checkbox
                        id="terms"
                        checked={acceptTerms}
                        onCheckedChange={(c) => setAcceptTerms(c as boolean)}
                      />
                      <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer select-none">
                        J&apos;accepte les{' '}
                        <Link href="#" className="text-blue-600 hover:underline font-medium">Conditions d&apos;utilisation</Link>
                      </label>
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-xl text-base font-semibold mt-2 transition-all"
                    >
                      Continuer
                    </Button>

                    {/* Already have account */}
                    <div className="pt-4 border-t border-gray-100 mt-6">
                      <p className="text-center text-sm text-gray-500 mb-4">
                        Vous avez déjà un compte ?
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-11 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold transition-all"
                        onClick={() => router.push('/login')}
                      >
                        Se connecter
                      </Button>
                    </div>
                  </form>
                </>
              )}

              {/* ── STEP 2 ─────────────────────────────────────────────── */}
              {step === 2 && (
                <>
                  <div className="mb-7">
                    <h2 className="text-2xl font-bold text-gray-900">Complétez votre profil</h2>
                    <p className="text-sm text-gray-500 mt-1">Ces informations sont nécessaires pour valider votre inscription</p>
                  </div>

                  <form onSubmit={handleStep2Submit} className="space-y-4">
                    {/* Error message */}
                    {error && (
                      <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-4">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Téléphone */}
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+213 6 12 34 56 78"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white transition-colors"
                      />
                    </div>

                    {/* Adresse */}
                    <div className="space-y-1.5">
                      <Label htmlFor="address" className="text-sm font-medium text-gray-700">Adresse</Label>
                      <Input
                        id="address"
                        placeholder="123 Rue de la République..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white transition-colors"
                      />
                    </div>

                    {/* Ville + Pays */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="city" className="text-sm font-medium text-gray-700">Ville</Label>
                        <Input
                          id="city"
                          placeholder="Ex : Alger, Paris…"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          required
                          className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="country" className="text-sm font-medium text-gray-700">Pays</Label>
                        <Input
                          id="country"
                          placeholder="Ex : Algérie, France…"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          required
                          className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    {/* Poste + Institution */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="position" className="text-sm font-medium text-gray-700">Poste actuel</Label>
                        <Input
                          id="position"
                          placeholder="Étudiant / Prof."
                          value={position}
                          onChange={(e) => setPosition(e.target.value)}
                          required
                          className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="institution" className="text-sm font-medium text-gray-700">Institution</Label>
                        <Input
                          id="institution"
                          placeholder="Université …"
                          value={institution}
                          onChange={(e) => setInstitution(e.target.value)}
                          required
                          className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    {/* File uploads */}
                    <div className="space-y-3 pt-1">
                      <Label className="text-sm font-semibold text-gray-700">Pièces jointes</Label>
                      {([
                        { id: 'cv', label: 'CV', file: cvFile, setter: setCvFile, accept: '.pdf,.doc,.docx' },
                        { id: 'letter', label: 'Lettre de motivation', file: letterFile, setter: setLetterFile, accept: '.pdf,.doc,.docx' },
                        { id: 'cin', label: 'CIN', file: cinFile, setter: setCinFile, accept: '.pdf,.jpg,.jpeg,.png' },
                      ] as const).map(({ id, label, file, setter, accept }) => (
                        <div key={id}>
                          <input
                            id={id}
                            type="file"
                            accept={accept}
                            onChange={(e) => handleFileUpload(e, setter as (f: File | null) => void)}
                            className="hidden"
                          />
                          <label
                            htmlFor={id}
                            className={`flex items-center gap-3 w-full py-3 px-4 border-2 border-dashed rounded-xl transition-colors cursor-pointer ${accountType === 'Enseignant' && !file
                              ? 'border-orange-200 bg-orange-50/30 hover:border-orange-400 hover:bg-orange-50'
                              : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                              }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${accountType === 'Enseignant' && !file ? 'bg-orange-100' : 'bg-blue-100'
                              }`}>
                              <Upload className={`w-4 h-4 ${accountType === 'Enseignant' && !file ? 'text-orange-600' : 'text-blue-600'
                                }`} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-700">
                                {label} {accountType === 'Enseignant' && <span className="text-orange-600">*</span>}
                              </p>
                              <p className="text-xs text-gray-400">
                                {file ? file.name : (accountType === 'Enseignant' ? 'Obligatoire' : 'Cliquez pour télécharger')}
                              </p>
                            </div>
                            {file && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
                          </label>
                        </div>
                      ))}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1 h-12 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-all"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Envoi...
                          </>
                        ) : (
                          'Soumettre'
                        )}
                      </Button>
                    </div>
                  </form>
                </>
              )}

              {/* ── SUCCESS ────────────────────────────────────────────── */}
              {step === 'success' && (
                <div className="py-8 text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Demande envoyée !
                    </h2>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                      Votre demande a été transmise à l&apos;administrateur. Un email de
                      confirmation vous sera envoyé après validation.
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push('/')}
                    className="bg-blue-600 hover:bg-blue-700 h-12 px-10 rounded-xl font-semibold"
                  >
                    Retour à l&apos;accueil
                  </Button>
                </div>
              )}

            </div>
            {/* end card */}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}