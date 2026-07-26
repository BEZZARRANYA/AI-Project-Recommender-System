import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";

const DotGrid = lazy(() => import("../components/DotGrid"));

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

function Home() {
  const { scrollY } = useScroll();

  const heroY = useTransform(scrollY, [0, 700], [0, -90]);
  const heroGlowY = useTransform(scrollY, [0, 700], [0, -120]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0.72]);
  const cardY = useTransform(scrollY, [0, 700], [0, -70]);

  const enableDotGrid =
    typeof window !== "undefined" &&
    window.innerWidth > 768 &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <main className="relative overflow-hidden bg-surface-950">
      {enableDotGrid && (
        <Suspense fallback={null}>
          <DotGrid
            className="dot-grid-page opacity-55"
            dotSize={5}
            gap={28}
            baseColor="#261109"
            activeColor="#ff5a1f"
            proximity={120}
            speedTrigger={85}
            shockRadius={170}
            shockStrength={3}
            returnDuration={1.1}
          />
        </Suspense>
      )}

      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(to_bottom,rgba(5,5,5,0.18),rgba(5,5,5,0.55)_35%,rgba(5,5,5,0.78)_70%,rgba(5,5,5,0.92)_100%)]" />

      <section className="noise-overlay relative z-10 min-h-[94vh] overflow-hidden">
        <motion.div
          style={{ y: heroGlowY }}
          className="absolute inset-0 bg-radial-brand opacity-70"
        />

        <div className="absolute inset-0 bg-hero-grid hero-grid opacity-[0.05]" />

        <div className="container-shell relative z-10 flex min-h-[94vh] items-center py-20">
          <div className="grid w-full items-center gap-16 lg:grid-cols-[1.15fr_0.85fr]">
            <motion.div
              style={{ y: heroY, opacity: heroOpacity }}
              className="max-w-4xl"
            >
              <motion.p
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mb-6 inline-flex rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.25em] text-brand-300"
              >
                Intelligent Thesis Showcase
              </motion.p>

              <motion.h1
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="max-w-5xl text-5xl font-black leading-[0.92] text-white sm:text-6xl md:text-7xl lg:text-[5.8rem]"
              >
                AI Project
                <br />
                Recommender —
                <br />
                <span className="text-brand-500">Projects That Move You</span>
              </motion.h1>

              <motion.p
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mt-8 max-w-2xl text-base leading-8 text-white/65 sm:text-lg"
              >
                A cinematic recommender experience for students, creators, and thesis
                demos. Match your skills, interests, stack, and preferred challenge
                with curated ideas scored by your backend engine.
              </motion.p>

              <motion.div
                custom={3}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mt-10 flex flex-col gap-4 sm:flex-row"
              >
                <Link to="/questionnaire" className="btn-primary cursor-target">
                  Start Recommending
                </Link>
                <a href="#about" className="btn-secondary cursor-target">
                  About the Project
                </a>
              </motion.div>

              <motion.div
                custom={4}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mt-12 flex flex-wrap gap-3"
              >
                {["Node + Express", "MongoDB", "Framer Motion", "Tailwind"].map(
                  (item) => (
                    <span key={item} className="tag-pill">
                      {item}
                    </span>
                  )
                )}
              </motion.div>
            </motion.div>

            <motion.div
              style={{ y: cardY }}
              initial={{ opacity: 0, scale: 0.94, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="glass-panel relative overflow-hidden rounded-[2rem] p-6 shadow-soft">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-white/5" />
                <div className="relative space-y-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                        Recommendation Engine
                      </p>
                      <h3 className="mt-2 text-2xl font-bold text-white">
                        Live Preference Mapping
                      </h3>
                    </div>
                    <div className="rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs text-brand-300">
                      Active
                    </div>
                  </div>

                  {[
                    {
                      label: "Skill Match",
                      value: "Advanced",
                      width: "86%"
                    },
                    {
                      label: "Tech Alignment",
                      value: "React / JS / Python",
                      width: "92%"
                    },
                    {
                      label: "Interest Fit",
                      value: "AI / Web / Analytics",
                      width: "78%"
                    }
                  ].map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/65">{item.label}</span>
                        <span className="text-white">{item.value}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: item.width }}
                          transition={{ duration: 1.1, delay: 0.25 }}
                          className="h-2 rounded-full bg-gradient-to-r from-brand-500 to-orange-300"
                        />
                      </div>
                    </div>
                  ))}

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                        Top Score
                      </p>
                      <p className="mt-3 text-3xl font-black text-white">9.6</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                        Results
                      </p>
                      <p className="mt-3 text-3xl font-black text-white">10</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="about" className="relative z-10 py-24">
        <div className="container-shell">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="mb-3 text-sm uppercase tracking-[0.24em] text-brand-400">
                About the Project
              </p>
              <h2 className="section-title">
                Built for discovery, clarity, and momentum.
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 38 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <p className="section-copy">
                This thesis project transforms a traditional recommendation flow
                into an immersive product experience. Instead of browsing random
                ideas, users submit a focused profile of their skill level,
                desired challenge, preferred technologies, and interests.
              </p>
              <p className="section-copy">
                The backend scores each project using your MongoDB dataset and
                returns the strongest matches. The interface then presents those
                results through motion, hierarchy, and premium visual feedback
                designed for live presentations.
              </p>
              <Link to="/questionnaire" className="btn-primary cursor-target mt-2">
                Launch Questionnaire
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative z-10 pb-24">
        <div className="container-shell">
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel rounded-[2rem] p-8 shadow-soft sm:p-10"
          >
            <div className="grid gap-8 lg:grid-cols-3">
              {[
                {
                  title: "Smart Matching",
                  copy:
                    "Projects are ranked against your skill level, preferred stack, and interests."
                },
                {
                  title: "Live Demo Ready",
                  copy:
                    "Smooth transitions, motion hierarchy, and saved state make the presentation flow reliable."
                },
                {
                  title: "Built for Thesis Impact",
                  copy:
                    "A recommendation engine wrapped in a premium UI that feels intentional, modern, and memorable."
                }
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-white/10 bg-black/25 p-6">
                  <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/60">{item.copy}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

export default Home;
