import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Proposals from "@/components/Proposals";
import NameStory from "@/components/NameStory";
import Objectives from "@/components/Objectives";
import Statement from "@/components/Statement";
import CalendarioPreview from "@/components/CalendarioPreview";
import Buzon from "@/components/Buzon";
import ComingSoon from "@/components/ComingSoon";
import Footer from "@/components/Footer";
import ScrollAnimations from "@/components/ScrollAnimations";

export default function Home() {
  return (
    <>
      <ScrollAnimations />
      <Header />
      <main id="top">
        <Hero />
        <Statement />
        <About />
        <Proposals />
        <NameStory />
        <Objectives />
        <CalendarioPreview />
        <Buzon />
        <ComingSoon />
      </main>
      <Footer />
    </>
  );
}
