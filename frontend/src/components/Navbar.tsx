import {
  NavigationMenu,
  NavigationMenuContent,
  //NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  //NavigationMenuViewport,
} from "@/components/ui/navigation-menu"
import { ModeToggle } from "./mode-toggle"

export function Navbar(){
    return (
        <NavigationMenu>
        <NavigationMenuList>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Home</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md"
                    href="/"
                  >
                    <div className="mt-4 mb-2 text-lg font-medium">
                      shadcn/ui
                    </div>
                    <p className="text-muted-foreground text-sm leading-tight">
                      Beautifully designed components built with Tailwind CSS.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <a href="/docs" title="Introduction">
                Re-usable components built using Radix UI and Tailwind CSS.
              </a>
              <a href="/docs/installation" title="Installation">
                How to install dependencies and structure your app.
              </a>
              <a href="/docs/primitives/typography" title="Typography">
                Styles for headings, paragraphs, lists...etc
              </a>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
            <NavigationMenuTrigger>Simple</NavigationMenuTrigger>
            <NavigationMenuContent>
                <ul className="grid w-[200px] gap-4">
                    <li>
                        <NavigationMenuLink asChild>
                            <a href="#">Components</a>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                            <a href="#">Documentation</a>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                            <a href="#">Blocks</a>
                        </NavigationMenuLink>
                    </li>
                </ul>
            </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>List</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] gap-4">
              <li>
                <NavigationMenuLink asChild>
                  <a href="#">
                    <div className="font-medium">Components</div>
                    <div className="text-muted-foreground">
                      Browse all components in the library.
                    </div>
                  </a>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <a href="#">
                    <div className="font-medium">Documentation</div>
                    <div className="text-muted-foreground">
                      Learn how to use the library.
                    </div>
                  </a>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <a href="#">
                    <div className="font-medium">Blog</div>
                    <div className="text-muted-foreground">
                      Read our latest blog posts.
                    </div>
                  </a>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

                    
        <NavigationMenuItem>
            <ModeToggle/>
        </NavigationMenuItem>

        </NavigationMenuList>
        </NavigationMenu>
    )
}