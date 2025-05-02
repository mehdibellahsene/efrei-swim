"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Calendar, CreditCard, Users, Waves, Award, Timer } from "lucide-react"
import { ArticlePreview } from "@/components/article-preview"
import { getAllArticles, getAllUsers, getUpcomingEvents, getAllCards } from "@/lib/supabase-api"
import type { Article } from "@/lib/types"
import { motion } from "framer-motion"

export function LandingPage() {
  const { user } = useAuth()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [activeMembers, setActiveMembers] = useState(0)
  const [totalSessions, setTotalSessions] = useState(0)
  const [totalEntries, setTotalEntries] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)

  // Water wave animation effect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleScroll = () => {
        if (heroRef.current) {
          const scrollPosition = window.scrollY
          const wavesElements = heroRef.current.querySelectorAll('.wave')
          wavesElements.forEach((wave, index) => {
            const speed = 0.2 + index * 0.1
            const element = wave as HTMLElement
            element.style.transform = `translateX(${scrollPosition * speed}px)`
          })
        }
      }
      
      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Fetch featured articles from the database
  useEffect(() => {
    async function fetchArticles() {
      try {
        const data = await getAllArticles(3) // Get just 3 featured articles
        setArticles(data || [])
      } catch (error) {
        console.error("Error fetching articles:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  // Fetch stats from the database
  useEffect(() => {
    async function fetchStats() {
      try {
        const users = await getAllUsers()
        setActiveMembers(users.length)

        const events = await getUpcomingEvents()
        setTotalSessions(events.length)

        const cards = await getAllCards()
        const entries = cards.reduce((sum, card) => sum + card.total_entries, 0)
        setTotalEntries(entries)
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="flex min-h-screen flex-col overflow-hidden w-full">
      {/* Water-themed floating bubbles background */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-100/20 dark:bg-blue-900/10"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 15}s infinite ease-in-out ${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 w-full">
        <div className="container mx-auto px-4 md:px-6 flex h-16 items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 font-bold"
          >
            <div className="flex items-center">
              <Waves className="h-6 w-6 text-blue-600 mr-2" />
              <Link href="/" className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text">
                EFREI Swim              </Link>
            </div>
          </motion.div>

          <nav className="flex items-center gap-3">
            {!loading && !user ? (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center gap-3"
              >
                {/* Show login/register buttons only for non-authenticated users */}
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    Connexion
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white transition-all hover:shadow-md">
                    Inscription
                  </Button>
                </Link>
              </motion.div>
            ) : user ? (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center gap-3"
              >
                {/* Show dashboard and profile links for authenticated users */}
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    Tableau de bord
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white transition-all hover:shadow-md">
                    Profil
                  </Button>
                </Link>
              </motion.div>
            ) : (
              // Show a placeholder while loading
              <div className="h-9 w-20 animate-pulse rounded bg-muted"></div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero section with water waves effect */}
        <section ref={heroRef} className="relative bg-gradient-to-b from-blue-50 to-white dark:from-blue-950 dark:to-background overflow-hidden w-full">
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
            <div className="wave relative h-20 bg-blue-400/10 dark:bg-blue-600/10" style={{
              maskImage: 'url("data:image/svg+xml;utf8,<svg viewBox=\'0 0 1200 120\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M0 0v46.29c47.79 22.2 103.59 32.17 158 28 70.36-5.37 136.33-33.31 206.8-37.5 73.84-4.36 147.54 16.88 218.2 35.26 69.27 18 138.3 24.88 209.4 13.08 36.15-6 69.85-17.84 104.45-29.34C989.49 25 1113-14.29 1200 52.47V0z\' opacity=\'.25\' fill=\'%23FFFFFF\' /></svg>")',
              maskSize: 'cover',
              maskRepeat: 'no-repeat',
            }}></div>
            <div className="wave relative h-20 bg-blue-400/20 dark:bg-blue-600/20 -mt-12" style={{
              maskImage: 'url("data:image/svg+xml;utf8,<svg viewBox=\'0 0 1200 120\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M0 0v46.29c47.79 22.2 103.59 32.17 158 28 70.36-5.37 136.33-33.31 206.8-37.5 73.84-4.36 147.54 16.88 218.2 35.26 69.27 18 138.3 24.88 209.4 13.08 36.15-6 69.85-17.84 104.45-29.34C989.49 25 1113-14.29 1200 52.47V0z\' opacity=\'.25\' fill=\'%23FFFFFF\' /></svg>")',
              maskSize: 'cover',
              maskRepeat: 'no-repeat',
            }}></div>
          </div>
          
          <div className="container mx-auto px-4 md:px-6 relative z-10 grid items-center gap-8 pb-20 pt-16 md:pb-24 md:pt-20 lg:pb-32 lg:pt-28">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex max-w-[600px] flex-col items-start gap-4"
              >
                <span className="inline-block rounded-full bg-blue-100 dark:bg-blue-900/50 px-3 py-1 text-sm font-medium text-blue-800 dark:text-blue-300">
                  Club Universitaire
                </span>
                <h1 className="text-4xl font-extrabold leading-tight tracking-tighter md:text-5xl lg:text-6xl bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 dark:from-blue-400 dark:via-blue-300 dark:to-blue-200 bg-clip-text text-transparent">
                  Plongez dans l'aventure<br/> EFREI Swim Team
                </h1>
                <p className="max-w-[700px] text-lg text-muted-foreground">
                  Suivez votre progression, et rejoignez la communauté des nageurs de l'EFREI.
                </p>
                {/* Hidden admin link with keyboard shortcut - only visible in source code */}
                <div id="admin-access" className="hidden">
                  <Link href="/admin/login">Admin access</Link>
                </div>

                <div className="flex flex-wrap gap-4 mt-2">
                  {!loading && !user ? (
                    <>
                      {/* CTA buttons for non-authenticated users */}
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Link href="/auth/signup">
                          <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all hover:shadow-xl hover:shadow-blue-600/30">
                            Commencer maintenant
                          </Button>
                        </Link>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Link href="/auth/login">
                          <Button variant="outline" size="lg" className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                            Se connecter
                          </Button>
                        </Link>
                      </motion.div>
                    </>
                  ) : user ? (
                    <>
                      {/* CTA buttons for authenticated users */}
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Link href="/dashboard">
                          <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all hover:shadow-xl hover:shadow-blue-600/30">
                            Aller au tableau de bord
                          </Button>
                        </Link>
                      </motion.div>
                    </>
                  ) : null}
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="relative md:flex-1 flex justify-center"
              >
                <div className="relative w-full max-w-[400px] aspect-video bg-blue-600/10 rounded-2xl overflow-hidden shadow-xl">
                  <div className="absolute inset-0 bg-[url('https://washcollsports.com/images/2022/7/18/casey1.jpg')] bg-cover bg-center opacity-85"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <p className="font-medium">Entraînements réguliers</p>
                    <h3 className="text-xl font-bold">Rejoignez-nous chaque semaine</h3>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Stats section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6"
            >
              <div className="flex items-center gap-4 rounded-lg border border-border/40 bg-background/60 backdrop-blur p-4 shadow-sm">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-2">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{activeMembers}</h3>
                  <p className="text-sm text-muted-foreground">Membres actifs</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg border border-border/40 bg-background/60 backdrop-blur p-4 shadow-sm">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-2">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{totalSessions}</h3>
                  <p className="text-sm text-muted-foreground">Séances totales</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg border border-border/40 bg-background/60 backdrop-blur p-4 shadow-sm sm:col-span-2 lg:col-span-1">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-2">
                  <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{totalEntries}</h3>
                  <p className="text-sm text-muted-foreground">Entrées totales</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Activities section with water-themed cards */}
        <section className="w-full py-16 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <div className="space-y-2">
                <div className="flex justify-center mb-2">
                  <div className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/50 px-3 py-1">
                    <Waves className="mr-1 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-medium text-blue-800 dark:text-blue-300">Pour tous les niveaux</span>
                  </div>
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Nos activités</h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Découvrez les différentes activités proposées par notre club de natation.
                </p>
              </div>
            </motion.div>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <Card className="overflow-hidden border-blue-100 dark:border-blue-900/50 bg-gradient-to-b from-white to-blue-50 dark:from-background dark:to-blue-950/20 transition-all hover:shadow-md">
                  <div className="h-3 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-2">
                      <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="grid gap-1">
                      <CardTitle>Entraînements</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Des séances d&apos;entraînement régulières encadrées par des coachs qualifiés pour progresser à votre rythme.
                    </p>
                    <ul className="mt-4 space-y-2">
                      <li className="flex items-center text-sm">
                        <Timer className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span>3 séances hebdomadaires</span>
                      </li>
                      <li className="flex items-center text-sm">
                        <Users className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span>Groupes par niveau</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <Card className="overflow-hidden border-blue-100 dark:border-blue-900/50 bg-gradient-to-b from-white to-blue-50 dark:from-background dark:to-blue-950/20 transition-all hover:shadow-md">
                  <div className="h-3 bg-gradient-to-r from-blue-500 to-blue-700"></div>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-2">
                      <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="grid gap-1">
                      <CardTitle>Compétitions</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Participez à des compétitions universitaires et régionales tout au long de l&apos;année et représentez l&apos;EFREI.
                    </p>
                    <ul className="mt-4 space-y-2">
                      <li className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span>Calendrier annuel</span>
                      </li>
                      <li className="flex items-center text-sm">
                        <Award className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span>Championnats universitaires</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <Card className="overflow-hidden border-blue-100 dark:border-blue-900/50 bg-gradient-to-b from-white to-blue-50 dark:from-background dark:to-blue-950/20 transition-all hover:shadow-md">
                  <div className="h-3 bg-gradient-to-r from-blue-600 to-blue-800"></div>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-2">
                      <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="grid gap-1">
                      <CardTitle>Sorties</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Des événements sociaux et des sorties pour renforcer l&apos;esprit d&apos;équipe et créer des liens durables.
                    </p>
                    <ul className="mt-4 space-y-2">
                      <li className="flex items-center text-sm">
                        <Users className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span>Événements conviviaux</span>
                      </li>
                      <li className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span>Activités régulières</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Articles section with water-inspired background */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-background relative overflow-hidden">
          {/* Water ripple effect */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20">
              <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-ripple"></div>
              <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-ripple" style={{ animationDelay: '1s' }}></div>
              <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-ripple" style={{ animationDelay: '2s' }}></div>
            </div>
          </div>

          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <div className="space-y-2">
                <div className="flex justify-center mb-2">
                  <div className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/50 px-3 py-1">
                    <ArrowRight className="mr-1 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-medium text-blue-800 dark:text-blue-300">Actualités</span>
                  </div>
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Derniers articles</h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Restez informé des dernières actualités du club.
                </p>
              </div>
            </motion.div>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
              {articles.map((article, index) => (
                <motion.div 
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <ArticlePreview article={article} />
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex justify-center mt-12"
            >
              <Link href="/forum">
                <Button variant="outline" className="gap-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                  Voir tous les articles
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Join us call to action */}
        <section className="w-full py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="relative overflow-hidden rounded-2xl bg-blue-600 dark:bg-blue-800 p-8 md:p-12">
              {/* Background water pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0,0 L100,0 L100,5 C75,10 50,20 25,10 L0,5 Z" fill="currentColor"></path>
                  <path d="M0,20 L100,15 L100,30 C85,25 70,35 55,25 C40,15 15,20 0,25 Z" fill="currentColor"></path>
                  <path d="M0,40 L100,35 L100,50 C75,45 50,55 25,45 L0,50 Z" fill="currentColor"></path>
                  <path d="M0,60 L100,65 L100,75 C85,70 70,80 55,70 C40,60 15,65 0,70 Z" fill="currentColor"></path>
                  <path d="M0,80 L100,85 L100,100 L0,100 L0,95 C25,90 50,100 75,90 Z" fill="currentColor"></path>
                </svg>
              </div>

              <div className="relative z-10 flex flex-col items-center justify-between gap-8 md:flex-row">
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl text-white">Prêt à plonger avec nous ?</h2>
                  <p className="text-blue-100 md:text-lg">Rejoignez notre communauté de nageurs à l'EFREI et développez vos compétences.</p>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/auth/signup">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-medium shadow-lg shadow-blue-800/30">
                      Rejoindre le club
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 md:py-12 bg-gradient-to-b from-white to-blue-50 dark:from-background dark:to-blue-950/10 w-full">
        <div className="container mx-auto flex flex-col items-center justify-between gap-6 md:flex-row px-4 md:px-6">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <div className="flex items-center gap-2">
              <Waves className="h-5 w-5 text-blue-600" />
              <Link href="/" className="text-lg font-bold bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-400 dark:to-blue-200 bg-clip-text text-transparent">
                EFREI Swim
              </Link>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              &copy; {new Date().getFullYear()} EFREI Swim. Tous droits réservés.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div className="flex flex-col gap-2 col-span-2 sm:col-span-1">
              <p className="font-medium text-sm">Suivez-nous</p>
              <div className="flex gap-3">

                <Link href="https://www.instagram.com/natation_efrei_bdx/" className="text-muted-foreground hover:text-foreground">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes ripple {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

