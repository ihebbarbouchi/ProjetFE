'use client';

import { useState } from 'react';
import { PublicLayout } from '../components/PublicLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Mail, MapPin, Phone, Send } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Formulaire de contact envoyé :', { name, email, subject, message });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 3000);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'E-mail',
      content: 'support@edushare.com',
      link: 'mailto:support@edushare.com',
    },
    {
      icon: Phone,
      title: 'Téléphone',
      content: '+1 (555) 123-4567',
      link: 'tel:+15551234567',
    },
    {
      icon: MapPin,
      title: 'Plateforme en ligne',
      content: 'Accessible partout, à tout moment',
      link: null,
    },
  ];

  return (
    <PublicLayout>
      {/* Section Héro */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Contactez-nous
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              Vous avez des questions ou des commentaires ? Nous serions ravis de vous entendre.
              Envoyez-nous un message et nous vous répondrons dans les plus brefs délais.
            </p>
          </div>
        </div>
      </section>

      {/* Section Contact */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cartes d'informations de contact */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Informations de contact</h2>
                <p className="text-gray-600 mb-6">
                  Contactez-nous via l&apos;un de ces canaux. Nous sommes là pour vous aider !
                </p>
              </div>

              {contactInfo.map((info, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
                        {info.link ? (
                          <a
                            href={info.link}
                            className="text-gray-600 hover:text-blue-600 transition-colors"
                          >
                            {info.content}
                          </a>
                        ) : (
                          <p className="text-gray-600">{info.content}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Heures de bureau */}

            </div>

            {/* Formulaire de contact */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Envoyez-nous un message</CardTitle>
                  <CardDescription>
                    Remplissez le formulaire ci-dessous et nous vous répondrons dans les 24 heures
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <Send className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Message envoyé !</h3>
                      <p className="text-gray-600">
                        Merci de nous avoir contactés. Nous vous répondrons bientôt.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nom complet *</Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder="Jean Dupont"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Adresse e-mail *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="jean@exemple.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Sujet *</Label>
                        <Input
                          id="subject"
                          type="text"
                          placeholder="Comment pouvons-nous vous aider ?"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          placeholder="Dites-nous en plus sur votre demande..."
                          rows={6}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                        <Send className="w-4 h-4 mr-2" />
                        Envoyer le message
                      </Button>

                      <p className="text-sm text-gray-500 text-center">
                        Nous respectons votre vie privée. Vos informations ne seront jamais partagées avec des tiers.
                      </p>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Section FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Questions fréquemment posées
            </h2>
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Comment créer un compte ?</h3>
                  <p className="text-gray-600">
                    Cliquez sur le bouton &quot;S&apos;inscrire&quot; dans le menu de navigation et remplissez le formulaire d&apos;inscription.
                    Choisissez votre rôle (Étudiant, Enseignant ou Administrateur) et suivez les étapes de vérification.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">La plateforme est-elle gratuite ?</h3>
                  <p className="text-gray-600">
                    Oui ! EduShare est gratuit pour les étudiants et les enseignants. Nous croyons en rendre
                    l&apos;éducation de qualité accessible à tous.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Comment les enseignants sont-ils vérifiés ?</h3>
                  <p className="text-gray-600">
                    Après votre inscription en tant qu&apos;enseignant, votre candidature sera examinée par notre équipe d&apos;administration.
                    Nous vérifions les diplômes et l&apos;expérience d&apos;enseignement pour garantir la qualité du contenu sur notre plateforme.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Quels types de ressources puis-je trouver ?</h3>
                  <p className="text-gray-600">
                    Notre plateforme héberge une variété de ressources éducatives incluant des cours vidéo, des documents,
                    des PDF, des présentations et des quiz interactifs dans plusieurs matières et catégories.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
