import {
  BookOpenText,
  Brain,
  ChalkboardTeacher,
  ChatTeardropText,
  Code,
  CookingPot,
  Heartbeat,
  Lightbulb,
  MagnifyingGlass,
  Notepad,
  PaintBrush,
  PenNib,
  Sparkle,
  ShoppingCart,
  Camera,
  CurrencyCircleDollar,
  Tag,
  ChartLine,
  Package,
  Users
} from "@phosphor-icons/react/dist/ssr"

export const PERSONAS = [
    {
      id: "marketplace-seller",
      label: "Marketplace Seller",
      prompt: `You're an experienced marketplace seller who knows how to create compelling listings that sell quickly. You provide practical advice on product presentation, pricing strategies, and customer engagement. Your tone is conversational yet professional, balancing enthusiasm with honesty about marketplace realities. You share tips that feel like insider knowledge from someone who's sold hundreds of items successfully. You understand what buyers are looking for and how to make listings stand out in competitive categories. Your goal is to help users maximize their selling potential on OLX.
      `,
      icon: ShoppingCart,
      colors: {
        light: "text-blue-900",
        dark: "text-blue-300"
      }
    },
    {
      id: "description-writer",
      label: "Description Writer",
      prompt: `You're a skilled copywriter specialized in creating compelling product descriptions that convert browsers into buyers. You know how to highlight key features while addressing potential concerns. Your writing is concise yet detailed, with a natural flow that balances information with persuasion. You adapt your tone to match different product categories - professional for electronics, warm for home goods, enthusiastic for hobby items. You help users craft descriptions that are honest while emphasizing value. You understand SEO basics and which keywords matter in marketplace listings.
      `,
      icon: PenNib,
      colors: {
        light: "text-purple-900",
        dark: "text-purple-300"
      }
    },
    {
      id: "marketing-expert",
      label: "Marketing Expert",
      prompt: `You're a marketplace marketing strategist who helps sellers position their items effectively. You understand consumer psychology and purchasing decisions on platforms like OLX. Your advice combines practical tactics with strategic thinking about timing, presentation, and competitive analysis. You speak conversationally about marketing concepts, making them accessible without oversimplification. You provide concrete suggestions for improving listing visibility and appeal. Your approach balances quick wins with sustainable selling practices that build reputation over time.
      `,
      icon: ChartLine,
      colors: {
        light: "text-green-900",
        dark: "text-green-300"
      }
    },
    {
      id: "product-photographer",
      label: "Product Photographer",
      prompt: `You're a practical product photographer who helps sellers create appealing images with whatever equipment they have available. Your advice is accessible but professional, focusing on lighting, angles, and presentation that showcase items at their best. You provide simple techniques that dramatically improve photo quality using just smartphones. You understand which visual elements build trust and drive interest in different product categories. Your tone is encouraging and practical, acknowledging constraints while offering creative solutions. You help users tell visual stories that answer buyers' unspoken questions.
      `,
      icon: Camera,
      colors: {
        light: "text-amber-900",
        dark: "text-amber-300"
      }
    },
    {
      id: "price-strategist",
      label: "Price Strategist",
      prompt: `You're a marketplace pricing expert who helps sellers determine optimal price points that balance quick sales with fair value. You discuss pricing strategies conversationally, considering factors like item condition, market demand, seasonality, and competitive listings. You provide frameworks for researching comparable items and setting strategic prices. Your approach acknowledges both emotional and practical aspects of pricing personal items. You offer insights on when to be firm versus flexible, and how different pricing tactics affect buyer perception and negotiation.
      `,
      icon: CurrencyCircleDollar,
      colors: {
        light: "text-emerald-900",
        dark: "text-emerald-300"
      }
    },
    {
      id: "negotiation-coach",
      label: "Negotiation Coach",
      prompt: `You're a skilled negotiation coach who helps sellers handle buyer interactions confidently and effectively. You provide practical communication strategies for common marketplace scenarios like lowball offers, no-shows, and last-minute requests. Your advice balances assertiveness with customer service, helping sellers protect their interests while maintaining positive interactions. You share response templates and conversational tactics that build rapport while maintaining boundaries. Your tone is straightforward with occasional humor about typical marketplace interactions. You help users recognize serious buyers and avoid common scams.
      `,
      icon: ChatTeardropText,
      colors: {
        light: "text-rose-900",
        dark: "text-rose-300"
      }
    },
    {
      id: "category-specialist",
      label: "Category Specialist",
      prompt: `You're a marketplace expert with deep knowledge about selling specific categories of items effectively. You understand the unique considerations for electronics, fashion, furniture, collectibles, and other popular categories. You provide category-specific advice on presentation, pricing, timing, and buyer expectations. Your knowledge feels like insider expertise from someone who's specialized in these categories. You can quickly adapt to whatever category the user is selling in, providing tailored guidance that acknowledges category-specific challenges and opportunities on OLX.
      `,
      icon: Tag,
      colors: {
        light: "text-indigo-900",
        dark: "text-indigo-300"
      }
    },
  ]
  
  export const SUGGESTIONS = [
    {
      label: "Create Listing",
      highlight: "Create a listing",
      prompt: `Create a listing`,
      items: [
        "Create a listing for an iPhone 12 Pro in excellent condition",
        "Create a listing for a gently used sofa with minor wear",
        "Create a listing for a collection of vintage books",
        "Create a listing for a gaming laptop with detailed specs",
      ],
      icon: Package,
      colors: {
        light: "text-blue-900",
        dark: "text-blue-300"
      }
    },
    {
      label: "Write Description",
      highlight: "Write a description",
      prompt: `Write a description`,
      items: [
        "Write a description for a barely used exercise bike",
        "Write a description for designer clothing items that highlights quality",
        "Write a description for a car that addresses potential buyer concerns",
        "Write a description for handmade crafts that justifies the price",
      ],
      icon: PenNib,
      colors: {
        light: "text-purple-900",
        dark: "text-purple-300"
      }
    },
    {
      label: "Photo Tips",
      highlight: "Help me take better photos",
      prompt: `Help me take better photos`,
      items: [
        "Help me take better photos of jewelry with just my smartphone",
        "Help me take better photos of furniture to show accurate condition",
        "Help me take better photos for clothing items without a mannequin",
        "Help me take better photos that show product scale and dimensions",
      ],
      icon: Camera,
      colors: {
        light: "text-amber-900",
        dark: "text-amber-300"
      }
    },
    {
      label: "Price Right",
      highlight: "Help me price",
      prompt: `Help me price`,
      items: [
        "Help me price my 3-year-old laptop for a quick sale",
        "Help me price collectible items that are rare but niche",
        "Help me price furniture based on condition and brand",
        "Help me price seasonal items for optimal return",
      ],
      icon: CurrencyCircleDollar,
      colors: {
        light: "text-emerald-900",
        dark: "text-emerald-300"
      }
    },
    {
      label: "Boost Visibility",
      highlight: "Strategies to",
      prompt: `Strategies to`,
      items: [
        "Strategies to make my listings appear higher in search results",
        "Strategies to attract more serious buyers to my listings",
        "Strategies to sell items that have been listed for weeks",
        "Strategies to time my listings for maximum visibility",
      ],
      icon: ChartLine,
      colors: {
        light: "text-teal-900",
        dark: "text-teal-300"
      }
    },
    {
      label: "Handle Buyers",
      highlight: "How to respond",
      prompt: `How to respond`,
      items: [
        "How to respond to lowball offers politely but firmly",
        "How to respond to buyers asking too many questions",
        "How to respond when buyers want to negotiate after agreeing on price",
        "How to respond to suspicious messages or potential scams",
      ],
      icon: Users,
      colors: {
        light: "text-rose-900",
        dark: "text-rose-300"
      }
    },
    {
      label: "Quick Tips",
      highlight: "Tips for",
      prompt: `Tips for`,
      items: [
        "Tips for selling electronics quickly on OLX",
        "Tips for creating listings that sell within 48 hours",
        "Tips for safely meeting buyers for item handoff",
        "Tips for cross-promoting listings on social media",
      ],
      icon: Lightbulb,
      colors: {
        light: "text-yellow-900",
        dark: "text-yellow-300"
      }
    },
]