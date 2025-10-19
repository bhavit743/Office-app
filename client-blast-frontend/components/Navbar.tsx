import Link from "next/link";
import { useRouter } from "next/router";

export default function Navbar() {
  const router = useRouter();
  const current = router.pathname;

  const navItems = [
    { name: "Email", href: "/email" },
    { name: "Whatsapp", href: "/page2" },
    { name: "Contacts", href: "/contacts" },
  ];

  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50">
      <div className="mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="text-xl font-extrabold text-indigo-600">
          <img src="/logo.jpeg" className="h-16 w-auto mr-2"></img>
        </div>

        {/* Navigation */}
        <nav className="flex space-x-6">
          {navItems.map((item) => {
            const active = current === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <span
                  className={`cursor-pointer font-medium transition ${
                    active
                      ? "text-indigo-600 border-b-2 border-indigo-600 pb-1"
                      : "text-gray-700 hover:text-indigo-500"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
