import Link from "next/link"
import { BookOpen, Github, Heart, Linkedin, Twitter } from "lucide-react"

export default function Footer() {
    return (
        <footer className="bg-background border-t border-border/50 pt-20 pb-10">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10 mb-16">
                    <div className="col-span-2 lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-6 group">
                            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                <BookOpen className="w-6 h-6 text-primary" />
                            </div>
                            <span className="text-xl font-bold text-foreground">DocWise</span>
                        </Link>
                        <p className="text-muted-foreground mb-8 max-w-sm leading-relaxed">
                            Le compagnon qui aide les étudiants à valider leur diplôme, sans y passer leurs nuits.
                        </p>
                        <div className="flex gap-4">
                            <SocialLink icon={Twitter} href="#" />
                            <SocialLink icon={Github} href="#" />
                            <SocialLink icon={Linkedin} href="#" />
                        </div>
                    </div>

                    <FooterColumn title="Produit">
                        <FooterLink href="#features">Fonctionnalités</FooterLink>
                        <FooterLink href="#pricing">Tarifs</FooterLink>
                        <FooterLink href="#">Témoignages</FooterLink>
                    </FooterColumn>

                    <FooterColumn title="Ressources">
                        <FooterLink href="#">Blog Étudiant</FooterLink>
                        <FooterLink href="#">Exemples de rapports</FooterLink>
                        <FooterLink href="#">Méthodologie</FooterLink>
                    </FooterColumn>

                    <FooterColumn title="Légal">
                        <FooterLink href="#">Confidentialité</FooterLink>
                        <FooterLink href="#">CGU</FooterLink>
                        <FooterLink href="#">Mentions légales</FooterLink>
                    </FooterColumn>

                    <FooterColumn title="Aide">
                        <FooterLink href="#">FAQ</FooterLink>
                        <FooterLink href="#">Contact</FooterLink>
                        <FooterLink href="#">Support</FooterLink>
                    </FooterColumn>
                </div>

                <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} DocWise. Tous droits réservés.</p>
                    <div className="flex items-center gap-2">
                        <span>Fait avec</span>
                        <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                        <span>par des anciens étudiants</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

function SocialLink({ icon: Icon, href }: { icon: any, href: string }) {
    return (
        <Link href={href} className="p-2 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors">
            <Icon className="w-5 h-5" />
        </Link>
    )
}

function FooterColumn({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">{title}</h4>
            <div className="flex flex-col gap-3">
                {children}
            </div>
        </div>
    )
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <Link href={href} className="text-muted-foreground hover:text-foreground transition-colors text-sm hover:underline underline-offset-4">
            {children}
        </Link>
    )
}