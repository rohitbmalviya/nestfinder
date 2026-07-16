// ============================================================
// NestFinder — Database Seed
//
// Run with: pnpm db:seed
//
// Creates:
//   - 2 AGENT users (with agencyName + phone)
//   - 2 USER users (buyers/renters)
//   - 15 Properties across Mumbai, Bangalore, Delhi, Pune, Hyderabad
//     (realistic Indian prices, beds/baths/area, real-ish lat/lng)
//   - 3-5 PropertyImages per property (picsum.photos)
//   - Several Favorites for the demo USER (priya)
//   - 8 Enquiries across properties with varied statuses & dates
//
// Money: all prices stored in paise (1 INR = 100 paise)
// SALE prices: ₹85L – ₹4.5Cr in paise
// RENT prices: ₹25,000 – ₹1,20,000/month in paise
// ============================================================

import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'

// ─── Bootstrap DB (same URL logic as src/lib/db.ts) ──────────────────────────

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert INR to paise */
const inr = (rupees: number): number => Math.round(rupees * 100)

/** Subtract days from now */
function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

// ─── Seed data ────────────────────────────────────────────────────────────────

interface PropertySeed {
  title: string
  slug: string
  description: string
  propertyType: 'HOUSE' | 'APARTMENT' | 'VILLA' | 'PLOT' | 'COMMERCIAL'
  listingType: 'SALE' | 'RENT'
  priceINR: number        // full INR amount; converted to paise in seed
  bedrooms: number
  bathrooms: number
  areaSqft: number
  address: string
  city: string
  state: string
  pincode: string
  lat: number
  lng: number
  agentIndex: number      // 0 or 1 — which agent owns this listing
  status: 'ACTIVE' | 'SOLD' | 'RENTED'
  featured: boolean
  amenities: string       // comma-separated
  imageCount: number      // how many picsum images to generate (3-5)
}

// City lat/lng centroids (real coordinates):
// Mumbai:    19.0760, 72.8777
// Bangalore: 12.9716, 77.5946
// Delhi:     28.6139, 77.2090
// Pune:      18.5204, 73.8567
// Hyderabad: 17.3850, 78.4867

const properties: PropertySeed[] = [
  // ── Mumbai ──────────────────────────────────────────────────
  {
    title: 'Spacious 3BHK Sea-View Apartment in Bandra West',
    slug: 'spacious-3bhk-sea-view-bandra-west',
    description:
      'A stunning sea-facing 3BHK apartment in the heart of Bandra West. The living and dining areas open onto a wide balcony with unobstructed Arabian Sea views. Premium Italian marble flooring, modular kitchen with granite countertops, and three large ensuite bedrooms. The building has 24/7 security, a rooftop infinity pool, and a fully equipped gym. Walking distance to Linking Road, Carter Road, and top restaurants. A rare find at this price.',
    propertyType: 'APARTMENT',
    listingType: 'SALE',
    priceINR: 3_20_00_000, // ₹3.2 Cr
    bedrooms: 3,
    bathrooms: 3,
    areaSqft: 1850,
    address: '14, Sea Breeze CHS, Perry Road, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    lat: 19.0596,
    lng: 72.8295,
    agentIndex: 0,
    status: 'ACTIVE',
    featured: true,
    amenities: 'Swimming Pool,Gym,24x7 Security,Power Backup,Covered Parking,Rooftop Garden,Intercom,Visitor Parking',
    imageCount: 5,
  },
  {
    title: 'Elegant 4BHK Villa with Private Pool in Juhu',
    slug: 'elegant-4bhk-villa-private-pool-juhu',
    description:
      'An exclusive 4BHK independent villa spread across a 3500 sq ft plot in prestigious Juhu. Ground plus two floors with a private heated pool, landscaped garden, and dedicated home-theatre room. Imported Italian tiles, smart home automation (lighting, AC, security), and a 3-car garage. The master bedroom features a walk-in wardrobe and a spa-style bathroom. Close to Juhu Beach, Santacruz airport, and international schools. Ideal for HNI families seeking privacy and luxury.',
    propertyType: 'VILLA',
    listingType: 'SALE',
    priceINR: 4_50_00_000, // ₹4.5 Cr
    bedrooms: 4,
    bathrooms: 4,
    areaSqft: 3500,
    address: '7, Palm Avenue, JVPD Scheme, Juhu',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400049',
    lat: 19.1075,
    lng: 72.8263,
    agentIndex: 0,
    status: 'ACTIVE',
    featured: true,
    amenities: 'Private Pool,Garden,Home Theatre,Smart Automation,3-Car Garage,Power Backup,CCTV,Modular Kitchen',
    imageCount: 5,
  },
  {
    title: 'Cosy 2BHK Apartment for Rent in Andheri East',
    slug: 'cosy-2bhk-apartment-rent-andheri-east',
    description:
      'Fully furnished 2BHK apartment available on monthly rental in Andheri East, seconds from the metro station. Features a split AC in all rooms, a semi-modular kitchen with a refrigerator and washing machine, and laminated wooden flooring. The society has a children\'s play area, a garden, and CCTV surveillance. Ideal for working professionals or couples. Maintenance of ₹3,500/month is extra. Brokerage waived for direct tenants.',
    propertyType: 'APARTMENT',
    listingType: 'RENT',
    priceINR: 45_000, // ₹45,000/month
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 950,
    address: 'B-203, Harmony Heights, Marol Naka, Andheri East',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400059',
    lat: 19.1136,
    lng: 72.8697,
    agentIndex: 1,
    status: 'ACTIVE',
    featured: false,
    amenities: 'Fully Furnished,Split AC,Lift,Security,Children Play Area,CCTV,Power Backup',
    imageCount: 3,
  },
  {
    title: 'Premium Commercial Office Space in BKC',
    slug: 'premium-commercial-office-bkc',
    description:
      'Grade-A plug-and-play office space available for lease in the premium Bandra-Kurla Complex. Spans an entire floor with 12 ft ceiling height, floor-to-ceiling glass facade, and panoramic city views. Comes with 20 dedicated car parks, a fully fitted pantry, and a central HVAC system. The building has 24/7 multi-tier security, a DG backup, and high-speed fibre connectivity. Ideal for corporates, MNCs, and fintech firms. CAM charges ₹45/sq ft/month extra.',
    propertyType: 'COMMERCIAL',
    listingType: 'RENT',
    priceINR: 1_20_000, // ₹1.2L/month
    bedrooms: 0,
    bathrooms: 4,
    areaSqft: 3200,
    address: '12th Floor, Platina Tower, G Block, Bandra-Kurla Complex',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400051',
    lat: 19.0665,
    lng: 72.8635,
    agentIndex: 0,
    status: 'RENTED',
    featured: false,
    amenities: 'Plug and Play,Central HVAC,Fiber Internet,DG Backup,20 Car Parks,Pantry,24x7 Security,CCTV',
    imageCount: 3,
  },

  // ── Bangalore ──────────────────────────────────────────────
  {
    title: 'Modern 3BHK Flat in Whitefield Tech Corridor',
    slug: 'modern-3bhk-flat-whitefield-tech-corridor',
    description:
      'A well-designed 3BHK apartment in a gated township in Whitefield, minutes from major IT parks (EPIP Zone, ITPB). The apartment features vitrified tile flooring, a modular kitchen, and large windows bringing in ample natural light. The 5-acre township offers a clubhouse, Olympic-size pool, jogging track, and indoor sports courts. Excellent connectivity to Outer Ring Road and the upcoming Namma Metro Phase 2 station. OC received; immediate registration possible.',
    propertyType: 'APARTMENT',
    listingType: 'SALE',
    priceINR: 85_00_000, // ₹85L
    bedrooms: 3,
    bathrooms: 2,
    areaSqft: 1480,
    address: '301, Prestige Tech View, Siddapura, Whitefield',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560066',
    lat: 12.9698,
    lng: 77.7499,
    agentIndex: 1,
    status: 'ACTIVE',
    featured: true,
    amenities: 'Swimming Pool,Gym,Clubhouse,Jogging Track,Indoor Sports,24x7 Security,Power Backup,EV Charging',
    imageCount: 4,
  },
  {
    title: 'Luxury 5BHK Villa in Sarjapur Road',
    slug: 'luxury-5bhk-villa-sarjapur-road',
    description:
      'An ultra-premium 5BHK independent villa in a boutique gated community on Sarjapur Road. Spread across a 4800 sq ft plot with a built-up area of 4200 sq ft, the villa offers a private splash pool, rooftop deck, home office, and a 4-car basement parking. Double-height living room, floor-to-ceiling glass walls, and a gourmet kitchen with imported appliances. The community has a concierge, valet parking, and a lush 2-acre central park. 10 minutes to Electronic City.',
    propertyType: 'VILLA',
    listingType: 'SALE',
    priceINR: 3_80_00_000, // ₹3.8 Cr
    bedrooms: 5,
    bathrooms: 5,
    areaSqft: 4200,
    address: '12, Falcon Villas, Carmelaram, Sarjapur Road',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560035',
    lat: 12.9085,
    lng: 77.6869,
    agentIndex: 0,
    status: 'ACTIVE',
    featured: true,
    amenities: 'Private Pool,Rooftop Deck,4-Car Parking,Smart Home,Gym,Concierge,CCTV,Generator',
    imageCount: 5,
  },
  {
    title: '1BHK Apartment for Rent near Koramangala',
    slug: '1bhk-apartment-rent-koramangala',
    description:
      'Compact and well-maintained 1BHK apartment available for rent in a prime Koramangala location. The apartment has a semi-modular kitchen, 1 split AC, a loft for extra storage, and a western-style bathroom. The building has a lift and CCTV. Walking distance to Forum Mall, restaurants, cafes, and the Ejipura main road. Ideal for working professionals. 11-month lease. Deposit: 3 months\' rent. Immediate move-in available.',
    propertyType: 'APARTMENT',
    listingType: 'RENT',
    priceINR: 25_000, // ₹25,000/month
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 550,
    address: 'D-104, Sri Sai Gardens, 5th Block, Koramangala',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560095',
    lat: 12.9347,
    lng: 77.6205,
    agentIndex: 1,
    status: 'ACTIVE',
    featured: false,
    amenities: 'Semi-Furnished,Split AC,Lift,CCTV,24x7 Water',
    imageCount: 3,
  },

  // ── Delhi ──────────────────────────────────────────────────
  {
    title: '4BHK Builder Floor in Greater Kailash II',
    slug: '4bhk-builder-floor-greater-kailash-2',
    description:
      'A spacious and elegantly finished 4BHK builder floor on the first floor of an independent house in South Delhi\'s most sought-after colony — Greater Kailash II. The floor features 10 ft ceilings, Italian marble flooring throughout, a U-shaped modular kitchen with a Bosch chimney and hob, and four large bedrooms with attached bathrooms. Dedicated 2-car stilt parking. Located on a wide 30 ft road, two minutes from M Block Market. Excellent schools and hospitals nearby.',
    propertyType: 'HOUSE',
    listingType: 'SALE',
    priceINR: 2_80_00_000, // ₹2.8 Cr
    bedrooms: 4,
    bathrooms: 4,
    areaSqft: 2400,
    address: 'P-27, First Floor, M Block, Greater Kailash Part II',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110048',
    lat: 28.5441,
    lng: 77.2367,
    agentIndex: 0,
    status: 'ACTIVE',
    featured: true,
    amenities: 'Stilt Parking,Modular Kitchen,Marble Flooring,Power Backup,Security,CCTV,RO System',
    imageCount: 4,
  },
  {
    title: 'Compact 2BHK for Rent in Lajpat Nagar',
    slug: 'compact-2bhk-rent-lajpat-nagar',
    description:
      'Well-maintained 2BHK apartment available on rent in a popular South Delhi locality. Semi-furnished with wardrobes in all bedrooms, a modular kitchen, and laminate flooring. The society has a society park, underground water storage, and covered parking for one car. Located just 1 km from the Lajpat Nagar Metro station (Pink Line), making commuting effortless. Markets, hospitals, and AIIMS are within easy reach. Preferred non-vegetarian families. 11-month lease.',
    propertyType: 'APARTMENT',
    listingType: 'RENT',
    priceINR: 35_000, // ₹35,000/month
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 900,
    address: '403, Aashirwad Apartments, Lajpat Nagar III',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110024',
    lat: 28.5688,
    lng: 77.2396,
    agentIndex: 1,
    status: 'ACTIVE',
    featured: false,
    amenities: 'Semi-Furnished,Wardrobes,Covered Parking,Society Park,Underground Water,24x7 Security',
    imageCount: 3,
  },
  {
    title: 'Residential Plot in Dwarka Sector 12',
    slug: 'residential-plot-dwarka-sector-12',
    description:
      'A prime 200 sq yard (1800 sq ft) freehold residential plot in Dwarka Sector 12, approved by DDA. South-east facing on a 24 ft road. The plot is in a fully developed sector with ready infrastructure: wide roads, piped gas, underground drainage, and metro connectivity (Dwarka Sector 10 Metro, Blue Line). No encumbrances; clear title. Ideal for building a multi-storey independent house or investment. FAR of 200 allowed. Possession: immediate.',
    propertyType: 'PLOT',
    listingType: 'SALE',
    priceINR: 1_20_00_000, // ₹1.2 Cr
    bedrooms: 0,
    bathrooms: 0,
    areaSqft: 1800,
    address: 'Plot No. 47, Sector 12, Dwarka',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110078',
    lat: 28.5921,
    lng: 77.0454,
    agentIndex: 0,
    status: 'SOLD',
    featured: false,
    amenities: 'DDA Approved,Freehold,Clear Title,24ft Road,Metro Nearby,Piped Gas,Underground Drainage',
    imageCount: 3,
  },

  // ── Pune ───────────────────────────────────────────────────
  {
    title: '3BHK Apartment in Kalyani Nagar',
    slug: '3bhk-apartment-kalyani-nagar',
    description:
      'A contemporary 3BHK apartment in a premium high-rise in Kalyani Nagar — Pune\'s most cosmopolitan neighbourhood. The flat is on the 14th floor with panoramic views, a spacious balcony, and premium finishes throughout. The building offers a sky lounge, business centre, rooftop infinity pool, and a state-of-the-art gym. Walking distance to Café Coffee Day, popular eateries, and the MG Road entertainment hub. 5 km from the airport. OC received; RERA registered.',
    propertyType: 'APARTMENT',
    listingType: 'SALE',
    priceINR: 1_45_00_000, // ₹1.45 Cr
    bedrooms: 3,
    bathrooms: 2,
    areaSqft: 1620,
    address: '1402, Skyline Tower, Kalyani Nagar',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411006',
    lat: 18.5461,
    lng: 73.9009,
    agentIndex: 1,
    status: 'ACTIVE',
    featured: true,
    amenities: 'Swimming Pool,Gym,Sky Lounge,Business Centre,Power Backup,Covered Parking,CCTV,Intercom',
    imageCount: 4,
  },
  {
    title: '2BHK Flat for Rent in Baner',
    slug: '2bhk-flat-rent-baner',
    description:
      'Bright and airy 2BHK flat available for rent in the sought-after IT hub of Baner. Semi-furnished with split ACs in the master bedroom and living room, a modular kitchen with a chimney, and large windows letting in natural light. Gated society with a swimming pool, gym, and 24/7 security. 3 km from Pune University circle and within 2 km of Balewadi Sports Complex. Excellent connectivity to Hinjewadi IT Park (15 min). 11-month lease preferred.',
    propertyType: 'APARTMENT',
    listingType: 'RENT',
    priceINR: 30_000, // ₹30,000/month
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 1050,
    address: '204, Maple Heights, Baner Road, Baner',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411021',
    lat: 18.5590,
    lng: 73.7868,
    agentIndex: 0,
    status: 'ACTIVE',
    featured: false,
    amenities: 'Semi-Furnished,Split AC,Modular Kitchen,Swimming Pool,Gym,24x7 Security,Visitor Parking',
    imageCount: 3,
  },

  // ── Hyderabad ───────────────────────────────────────────────
  {
    title: '3BHK Luxury Apartment in Gachibowli',
    slug: '3bhk-luxury-apartment-gachibowli',
    description:
      'A move-in-ready 3BHK luxury apartment in the financial and IT district of Gachibowli. This premium flat features large floor-to-ceiling windows, high-quality vitrified tiles, a state-of-the-art modular kitchen, and a spacious master bedroom with a walk-in closet. The landmark township offers a 50,000 sq ft clubhouse, two swimming pools, a cricket pitch, and a multi-cuisine food court. 5-star amenities at a fraction of Mumbai or Bangalore prices. Walking distance to DLF Cyber City.',
    propertyType: 'APARTMENT',
    listingType: 'SALE',
    priceINR: 1_10_00_000, // ₹1.1 Cr
    bedrooms: 3,
    bathrooms: 3,
    areaSqft: 1900,
    address: '2403, Prestige High Fields, Gachibowli',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500032',
    lat: 17.4399,
    lng: 78.3489,
    agentIndex: 1,
    status: 'ACTIVE',
    featured: true,
    amenities: 'Clubhouse,Swimming Pool,Cricket Pitch,Gym,Food Court,Power Backup,EV Charging,24x7 Security',
    imageCount: 5,
  },
  {
    title: 'Spacious 4BHK Independent House in Jubilee Hills',
    slug: 'spacious-4bhk-independent-house-jubilee-hills',
    description:
      'A well-maintained 4BHK independent house (G+1) in the prestigious Jubilee Hills locality. Ground floor comprises a large living/dining room, a gourmet kitchen, two bedrooms, and a covered porch for 2 cars. First floor has two bedrooms with attached bathrooms, a study, and a terrace. 10 minutes to Road No. 36 restaurants, Chitrapuri Colony, and Film Nagar. Reputed schools (Oakridge, DPS) and hospitals within 3 km. Excellent appreciation area.',
    propertyType: 'HOUSE',
    listingType: 'SALE',
    priceINR: 2_25_00_000, // ₹2.25 Cr
    bedrooms: 4,
    bathrooms: 4,
    areaSqft: 3100,
    address: 'Plot 14, Road No. 45, Jubilee Hills',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500033',
    lat: 17.4326,
    lng: 78.4071,
    agentIndex: 0,
    status: 'ACTIVE',
    featured: false,
    amenities: '2-Car Porch,Terrace,Study Room,Gourmet Kitchen,CCTV,Bore Water,Power Backup',
    imageCount: 4,
  },
  {
    title: '2BHK Apartment for Rent in HITEC City',
    slug: '2bhk-apartment-rent-hitec-city',
    description:
      'Fully furnished 2BHK apartment for rent in a premium high-rise in HITEC City — the epicentre of Hyderabad\'s IT boom. The apartment is on the 9th floor with unobstructed views, two split ACs, a fully equipped kitchen (refrigerator, microwave, washing machine), and broadband internet included. Building amenities: gym, rooftop party hall, and CCTV. Direct access to Mindspace IT Park, Inorbit Mall, and the MMTS railway station. Preferred for IT professionals.',
    propertyType: 'APARTMENT',
    listingType: 'RENT',
    priceINR: 38_000, // ₹38,000/month
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 1100,
    address: '904, Azure Residency, Madhapur, HITEC City',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500081',
    lat: 17.4487,
    lng: 78.3773,
    agentIndex: 1,
    status: 'RENTED',
    featured: false,
    amenities: 'Fully Furnished,2 Split ACs,WiFi,Gym,Rooftop Hall,CCTV,Covered Parking,Power Backup',
    imageCount: 3,
  },
]

// ─── Main seed function ────────────────────────────────────────────────────────

async function main() {
  console.log('Seeding NestFinder database...\n')

  const SALT_ROUNDS = 10

  // ── 1. Users ─────────────────────────────────────────────────
  console.log('Creating users...')

  const agent1Hash = await bcrypt.hash('Agent@1234', SALT_ROUNDS)
  const agent2Hash = await bcrypt.hash('Agent@5678', SALT_ROUNDS)
  const user1Hash  = await bcrypt.hash('User@1234', SALT_ROUNDS)
  const user2Hash  = await bcrypt.hash('User@5678', SALT_ROUNDS)

  const agent1 = await prisma.user.upsert({
    where:  { email: 'rahul.verma@nestfinder.dev' },
    update: {
      passwordHash: agent1Hash,
      name: 'Rahul Verma',
      phone: '+91 98201 11234',
      role: 'AGENT',
      agencyName: 'Verma Realty Associates',
    },
    create: {
      email: 'rahul.verma@nestfinder.dev',
      passwordHash: agent1Hash,
      name: 'Rahul Verma',
      phone: '+91 98201 11234',
      role: 'AGENT',
      agencyName: 'Verma Realty Associates',
    },
  })

  const agent2 = await prisma.user.upsert({
    where:  { email: 'sneha.joshi@nestfinder.dev' },
    update: {
      passwordHash: agent2Hash,
      name: 'Sneha Joshi',
      phone: '+91 98765 44321',
      role: 'AGENT',
      agencyName: 'Joshi Prime Properties',
    },
    create: {
      email: 'sneha.joshi@nestfinder.dev',
      passwordHash: agent2Hash,
      name: 'Sneha Joshi',
      phone: '+91 98765 44321',
      role: 'AGENT',
      agencyName: 'Joshi Prime Properties',
    },
  })

  const user1 = await prisma.user.upsert({
    where:  { email: 'priya.sharma@example.com' },
    update: {
      passwordHash: user1Hash,
      name: 'Priya Sharma',
      phone: '+91 97301 55678',
      role: 'USER',
    },
    create: {
      email: 'priya.sharma@example.com',
      passwordHash: user1Hash,
      name: 'Priya Sharma',
      phone: '+91 97301 55678',
      role: 'USER',
    },
  })

  const user2 = await prisma.user.upsert({
    where:  { email: 'arjun.mehta@example.com' },
    update: {
      passwordHash: user2Hash,
      name: 'Arjun Mehta',
      phone: '+91 91234 76543',
      role: 'USER',
    },
    create: {
      email: 'arjun.mehta@example.com',
      passwordHash: user2Hash,
      name: 'Arjun Mehta',
      phone: '+91 91234 76543',
      role: 'USER',
    },
  })

  const agents = [agent1, agent2]
  console.log('  4 users done (2 agents, 2 buyers)')

  // ── 2. Properties + Images ───────────────────────────────────
  console.log('Creating properties and images...')

  const propertyMap: Record<string, string> = {} // slug → id

  for (const p of properties) {
    const agent = agents[p.agentIndex]

    const created = await prisma.property.upsert({
      where:  { slug: p.slug },
      update: {
        title: p.title,
        description: p.description,
        propertyType: p.propertyType,
        listingType: p.listingType,
        pricePaise: inr(p.priceINR),
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        areaSqft: p.areaSqft,
        address: p.address,
        city: p.city,
        state: p.state,
        pincode: p.pincode,
        lat: p.lat,
        lng: p.lng,
        agentId: agent.id,
        status: p.status,
        featured: p.featured,
        amenities: p.amenities,
      },
      create: {
        title: p.title,
        slug: p.slug,
        description: p.description,
        propertyType: p.propertyType,
        listingType: p.listingType,
        pricePaise: inr(p.priceINR),
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        areaSqft: p.areaSqft,
        address: p.address,
        city: p.city,
        state: p.state,
        pincode: p.pincode,
        lat: p.lat,
        lng: p.lng,
        agentId: agent.id,
        status: p.status,
        featured: p.featured,
        amenities: p.amenities,
      },
    })

    propertyMap[p.slug] = created.id

    // Upsert images: delete existing then re-create to keep positions stable
    await prisma.propertyImage.deleteMany({ where: { propertyId: created.id } })
    for (let i = 0; i < p.imageCount; i++) {
      await prisma.propertyImage.create({
        data: {
          propertyId: created.id,
          url: `https://picsum.photos/seed/${p.slug}-${i + 1}/800/600`,
          position: i,
        },
      })
    }
  }

  const totalImages = properties.reduce((sum, p) => sum + p.imageCount, 0)
  console.log(`  ${properties.length} properties + ${totalImages} images done`)

  // ── 3. Favorites ─────────────────────────────────────────────
  // Priya favourites several ACTIVE properties across different cities
  console.log('Creating favorites...')

  await prisma.favorite.deleteMany({
    where: { userId: { in: [user1.id, user2.id] } },
  })

  const priyaFavoriteSlugs = [
    'spacious-3bhk-sea-view-bandra-west',
    'modern-3bhk-flat-whitefield-tech-corridor',
    '3bhk-apartment-kalyani-nagar',
    '3bhk-luxury-apartment-gachibowli',
    'elegant-4bhk-villa-private-pool-juhu',
  ]

  const arjunFavoriteSlugs = [
    '4bhk-builder-floor-greater-kailash-2',
    'luxury-5bhk-villa-sarjapur-road',
    'spacious-4bhk-independent-house-jubilee-hills',
  ]

  for (const slug of priyaFavoriteSlugs) {
    if (propertyMap[slug]) {
      await prisma.favorite.create({
        data: { userId: user1.id, propertyId: propertyMap[slug] },
      })
    }
  }

  for (const slug of arjunFavoriteSlugs) {
    if (propertyMap[slug]) {
      await prisma.favorite.create({
        data: { userId: user2.id, propertyId: propertyMap[slug] },
      })
    }
  }

  console.log(`  ${priyaFavoriteSlugs.length + arjunFavoriteSlugs.length} favorites done`)

  // ── 4. Enquiries ─────────────────────────────────────────────
  console.log('Creating enquiries...')

  // Clear all existing enquiries for a clean slate on re-seed
  await prisma.enquiry.deleteMany({})

  interface EnquirySeed {
    slug: string
    userId: string | null
    name: string
    email: string
    phone: string
    message: string
    status: 'NEW' | 'CONTACTED' | 'CLOSED'
    daysAgoCreated: number
  }

  const enquiries: EnquirySeed[] = [
    {
      slug: 'spacious-3bhk-sea-view-bandra-west',
      userId: user1.id,
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+91 97301 55678',
      message: 'Hi, I am very interested in this property. Can we schedule a site visit this weekend? I am available on Saturday afternoon or Sunday morning.',
      status: 'CONTACTED',
      daysAgoCreated: 14,
    },
    {
      slug: 'elegant-4bhk-villa-private-pool-juhu',
      userId: user2.id,
      name: 'Arjun Mehta',
      email: 'arjun.mehta@example.com',
      phone: '+91 91234 76543',
      message: 'Is the price negotiable? We are serious buyers with pre-approved home loan. Looking to close within 30 days if the deal works out.',
      status: 'NEW',
      daysAgoCreated: 3,
    },
    {
      slug: 'modern-3bhk-flat-whitefield-tech-corridor',
      userId: user1.id,
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+91 97301 55678',
      message: 'Can you share the builder floor plan and RERA certificate? I would also like to know the exact EMI if I go for an 80% home loan at SBI rates.',
      status: 'CLOSED',
      daysAgoCreated: 30,
    },
    {
      slug: '4bhk-builder-floor-greater-kailash-2',
      userId: user2.id,
      name: 'Arjun Mehta',
      email: 'arjun.mehta@example.com',
      phone: '+91 91234 76543',
      message: 'Interested in viewing the property. Does the price include any parking? What is the maintenance per month?',
      status: 'CONTACTED',
      daysAgoCreated: 7,
    },
    {
      slug: '3bhk-luxury-apartment-gachibowli',
      userId: null, // guest enquiry
      name: 'Vikram Reddy',
      email: 'vikram.reddy@gmail.com',
      phone: '+91 99887 66554',
      message: 'Please call me at your earliest convenience. Looking to buy a 3BHK in Gachibowli for end use. Budget is around ₹1.1-1.2 Cr. Can you share property brochure?',
      status: 'NEW',
      daysAgoCreated: 1,
    },
    {
      slug: 'luxury-5bhk-villa-sarjapur-road',
      userId: null, // guest enquiry
      name: 'Meena Krishnan',
      email: 'meena.krishnan@techcorp.in',
      phone: '+91 98456 32109',
      message: 'We are an HNI family relocating from Singapore. The villa looks perfect. We need 5 bedrooms and a pool. Can we do a virtual tour first? We fly in next month.',
      status: 'CONTACTED',
      daysAgoCreated: 5,
    },
    {
      slug: '3bhk-apartment-kalyani-nagar',
      userId: user1.id,
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+91 97301 55678',
      message: 'This is within my budget. What floor is the apartment on and what direction does it face? Is there covered parking included in the price?',
      status: 'NEW',
      daysAgoCreated: 2,
    },
    {
      slug: 'spacious-4bhk-independent-house-jubilee-hills',
      userId: user2.id,
      name: 'Arjun Mehta',
      email: 'arjun.mehta@example.com',
      phone: '+91 91234 76543',
      message: 'We are looking for an independent house in Jubilee Hills. Can you share the complete property documents for our lawyer to review? Happy to give an advance if everything checks out.',
      status: 'CLOSED',
      daysAgoCreated: 20,
    },
  ]

  for (const e of enquiries) {
    const propertyId = propertyMap[e.slug]
    if (!propertyId) continue

    const createdAt = daysAgo(e.daysAgoCreated)
    await prisma.enquiry.create({
      data: {
        propertyId,
        userId: e.userId,
        name: e.name,
        email: e.email,
        phone: e.phone,
        message: e.message,
        status: e.status,
        createdAt,
      },
    })
  }

  console.log(`  ${enquiries.length} enquiries done`)

  // ── 5. Verify counts & print summary ─────────────────────────
  const [userCount, propertyCount, imageCount, favoriteCount, enquiryCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.propertyImage.count(),
      prisma.favorite.count(),
      prisma.enquiry.count(),
    ])

  console.log('\n┌───────────────────────────────────────────────────┐')
  console.log('│           NestFinder Seed Complete                 │')
  console.log('├───────────────────────────────────────────────────┤')
  console.log(`│  users            : ${String(userCount).padStart(4)}                          │`)
  console.log(`│  properties       : ${String(propertyCount).padStart(4)}                          │`)
  console.log(`│  property images  : ${String(imageCount).padStart(4)}                          │`)
  console.log(`│  favorites        : ${String(favoriteCount).padStart(4)}                          │`)
  console.log(`│  enquiries        : ${String(enquiryCount).padStart(4)}                          │`)
  console.log('├───────────────────────────────────────────────────┤')
  console.log('│  Demo credentials                                  │')
  console.log('│                                                    │')
  console.log('│  AGENT  rahul.verma@nestfinder.dev                 │')
  console.log('│         Agent@1234                                 │')
  console.log('│  AGENT  sneha.joshi@nestfinder.dev                 │')
  console.log('│         Agent@5678                                 │')
  console.log('│                                                    │')
  console.log('│  USER   priya.sharma@example.com                   │')
  console.log('│         User@1234                                  │')
  console.log('│  USER   arjun.mehta@example.com                    │')
  console.log('│         User@5678                                  │')
  console.log('└───────────────────────────────────────────────────┘\n')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
