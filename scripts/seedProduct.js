const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("../models/product");

dotenv.config({ path: "../.env" });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI not found in .env");
  process.exit(1);
}

// 5 curated products (shoes and watches) with working .jpg image URLs
const products = [
  {
    name: "Men's Sneakers",
    description: "Stylish and comfortable sneakers for everyday wear.",
    price: 2999,
    image: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg",
    category: "Men",
    stock: 25
  },
  {
    name: "Women's Heels",
    description: "Elegant heels perfect for parties and formal events.",
    price: 2799,
    image: "https://images.pexels.com/photos/2529147/pexels-photo-2529147.jpeg",
    category: "Women",
    stock: 20
  },
  {
    name: "Kid's Shoes",
    description: "Durable and fun shoes for active kids.",
    price: 1599,
    image: "https://images.pexels.com/photos/1456734/pexels-photo-1456734.jpeg",
    category: "Kids",
    stock: 18
  },
  {
    name: "Men's Watch",
    description: "Luxury men's watch with leather strap.",
    price: 4999,
    image: "https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg",
    category: "Men",
    stock: 10
  },
  {
    name: "Women's Watch",
    description: "Stylish watch for women with metallic finish.",
    price: 4499,
    image: "https://images.pexels.com/photos/277319/pexels-photo-277319.jpeg",
    category: "Women",
    stock: 12
  },
  {
    name: "Men's Sneakers",
    description: "Stylish and comfortable sneakers for everyday wear.",
    price: 2999,
    image: "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg",
    category: "Men",
    stock: 25
  },
  {
    name: "Elegant Women's Heels",
    description: "Perfect for parties and formal events, these heels offer style and comfort.",
    price: 2799,
    image: "https://images.pexels.com/photos/1445696/pexels-photo-1445696.jpeg",
    category: "Women",
    stock: 20
  },
  {
    name: "Kid's Colorful Shoes",
    description: "Durable and fun shoes for active kids.",
    price: 1599,
    image: "https://images.pexels.com/photos/6050917/pexels-photo-6050917.jpeg",
    category: "Kids",
    stock: 18
  },

  //new
 
  {
    name: "UrbanFlex Men's Knit Sneakers",
    description: "Experience the perfect blend of style and comfort with these lightweight knit sneakers, designed for the modern man on the go. The breathable fabric and flexible sole make them ideal for all-day wear.",
    price: 3499,
    image: "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg",
    category: "Men",
    stock: 45
  },
  {
    name: "Elegance Stride Women's Classic Pumps",
    description: "Step out in confidence with these timeless black stiletto heels. Their elegant design and comfortable insole make them a perfect choice for formal events, business meetings, or a sophisticated night out.",
    price: 2899,
    image: "https://images.pexels.com/photos/1445696/pexels-photo-1445696.jpeg",
    category: "Women",
    stock: 30
  },
  
  
  
  {
    name: "Gentleman's Choice Leather Oxfords",
    description: "Exude sophistication with these classic Oxford shoes. Crafted from premium polished leather, they are the perfect finishing touch for any formal or professional attire.",
    price: 4599,
    image: "https://images.pexels.com/photos/292999/pexels-photo-292999.jpeg",
    category: "Men",
    stock: 20
  },
  
  
  {
    name: "Classic Suede Men's Loafers",
    description: "Effortlessly stylish, these suede loafers provide a smart-casual look. The comfortable slip-on design and soft interior make them perfect for weekend outings or a relaxed day at the office.",
    price: 3299,
    image: "https://images.pexels.com/photos/1040384/pexels-photo-1040384.jpeg",
    category: "Men",
    stock: 22
  },

   {
    name: "Luxury Leather Sneakers - White",
    description: "Premium white leather sneakers with signature detailing. Crafted from the finest Italian leather with a comfortable cushioned sole and iconic side stripe design.",
    price: 65000,
    image: "https://media.gucci.com/style/HEXFBFBFB_South_0_160_640x640/1753977668/857018_AAF1X_2750_002_100_0000_Light.jpg",
    category: "Men",
    stock: 15
  },
  {
    name: "Ace Designer Sneakers - Classic",
    description: "Iconic ace sneakers featuring premium canvas and leather construction. The timeless design includes signature web stripe and gold-tone hardware details.",
    price: 58000,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIoecjxy82OJEfv9hcklsrBZdKnsUtQRWu0dDbSciw4KW7ORK9cXrGMC06EipNNI4lNv8&usqp=CAU",
    category: "Men",
    stock: 18
  },
  {
    name: "Designer Low-Top Sneakers",
    description: "Elegant low-top sneakers with contrasting heel detail. Features soft leather upper, comfortable fit, and signature branding for the fashion-forward individual.",
    price: 62000,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRndlAnGUJNAD1KvVz723aH8cUiQNt4UuWA-vew2BLniM8dFiKmmURNEtonsd9SvCV2oeU&usqp=CAU",
    category: "Men",
    stock: 12
  },
  {
    name: "Signature Canvas Sneakers - Beige",
    description: "Sophisticated beige canvas sneakers with leather trim. The perfect blend of casual comfort and luxury styling with iconic monogram details.",
    price: 59500,
    image: "https://media.gucci.com/style/HEXFBFBFB_South_0_160_640x640/1753977669/857018_AAFUH_1086_001_100_0000_Light.jpg",
    category: "Men",
    stock: 20
  },
  {
    name: "Embroidered Luxury Sneakers",
    description: "Exquisite sneakers featuring intricate embroidery and premium materials. A statement piece that combines traditional craftsmanship with modern design aesthetics.",
    price: 68000,
    image: "https://media.gucci.com/style/HEXFBFBFB_South_0_160_640x640/1738348236/832461_AAEW3_1042_001_100_0000_Light.jpg",
    category: "Men",
    stock: 10
  },
  {
    name: "Heritage Leather Sneakers - Brown",
    description: "Classic brown leather sneakers with vintage-inspired design. Features premium full-grain leather, padded collar, and distinctive brand emblem.",
    price: 54000,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFXov4LvLpz5vKp5hUFbQRqdFL_g5oiyKxHLvAH0yk4LgIyi7VR2Ybm3ZX4whfd0UIl9o&usqp=CAU",
    category: "Men",
    stock: 16
  },
  {
    name: "Metallic Accent Sneakers",
    description: "Contemporary sneakers with metallic detailing and luxe finishes. Combines sporty silhouette with high-fashion elements for a bold, modern look.",
    price: 61500,
    image: "https://tshop.r10s.jp/tieel/cabinet/item2024/04-2-3/4273_0.jpg?fitin=720%3A720",
    category: "Women",
    stock: 14
  },
  {
    name: "Platform Designer Sneakers",
    description: "Elevated platform sneakers with chunky sole design. Features premium materials, signature branding, and enhanced comfort for all-day wear.",
    price: 57500,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRIdcjBhHn37QG2m9JCRr9HF7EiywM44j2weM3S6FuuI9rsUZVS9i8rz8v_eRTqoZUJTY&usqp=CAU",
    category: "Women",
    stock: 22
  },
  {
    name: "Navy Blue Casual Sneakers",
    description: "Stylish navy blue sneakers with contrasting accents. Perfect for casual outings with a premium leather construction and comfortable cushioned insole.",
    price: 45000,
    image: "https://rukminim2.flixcart.com/image/480/580/jyg5lzk0/shoe/b/p/2/sn-105-premium-casual-shoes-gucci-style-for-women-36-rnk-navy-original-imafgnqavyxfpngd.jpeg?q=90",
    category: "Women",
    stock: 25
  },
  {
    name: "Monogram Print Luxury Sneakers",
    description: "Exclusive sneakers featuring all-over monogram print canvas. Combines heritage design elements with contemporary styling and superior comfort.",
    price: 63500,
    image: "https://www.fashiola.in/product-list/116745181.webp",
    category: "Women",
    stock: 13
  },
  
  {
    name: "Women's Luxury Mule Slides",
    description: "Elegant backless mule slides crafted from premium leather. Features a sophisticated silhouette with iconic logo detailing and a comfortable low heel for effortless style.",
    price: 48000,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-FeGyvGcsT5T-pLJ3OiVZ3c9WGbeKP26uhg&s",
    category: "Women",
    stock: 18
  },
  {
    name: "Designer Leather Loafers - Women",
    description: "Classic leather loafers with signature horsebit detail. Timeless design meets modern comfort with premium construction and iconic brand embellishments.",
    price: 52000,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaYQmbuaO_rOtvvF0qtragPlewuSIqUtLOV5d3hA_JXcbtZ11ll09WGC4zE3g3Uig3gA0&usqp=CAU",
    category: "Women",
    stock: 16
  },
  {
    name: "Women's Slip-On Designer Sneakers",
    description: "Sophisticated slip-on sneakers featuring luxurious materials and minimalist design. Perfect blend of casual comfort and high-fashion elegance with signature branding.",
    price: 55000,
    image: "https://images.bloomingdalesassets.com/is/image/BLM/products/9/optimized/14424449_fpx.tif?$2014_BROWSE_FASHION$&qlt=80,0&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=jpeg&wid=342&hei=428",
    category: "Women",
    stock: 14
  },
  {
    name: "Women's High-Top Luxury Sneakers",
    description: "Bold high-top sneakers with distinctive design elements. Premium canvas and leather construction with eye-catching details and superior ankle support.",
    price: 64000,
    image: "https://img.giglio.com/imager/prodPage/H36822.007_1/gucci.jpg",
    category: "Women",
    stock: 12
  },
  {
    name: "Embellished Platform Sneakers - Women",
    description: "Statement platform sneakers adorned with crystals and metallic accents. Features chunky sole, premium materials, and dazzling embellishments for a show-stopping look.",
    price: 72000,
    image: "https://cdn.mos.cms.futurecdn.net/whowhatwear/posts/309928/best-gucci-shoes-309928-1696845971644-main.jpg",
    category: "Women",
    stock: 10
  },
  {
    name: "Women's Classic White Court Sneakers",
    description: "Timeless white leather court sneakers with clean lines. Features signature green and red web stripe, gold-tone details, and cushioned comfort for everyday luxury.",
    price: 56500,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwMtmVECMsjUojNSZzpNjUuo5vOGPAjbqfbjVefqxF43A9XYpuoJOX38G6j1LRFrK9Kys&usqp=CAU",
    category: "Women",
    stock: 20
  },
  {
    name: "Women's Heritage Rhyton Sneakers",
    description: "Vintage-inspired oversized sneakers with distressed detailing. Features chunky retro silhouette, premium leather construction, and iconic logo print for bold style.",
    price: 69000,
    image: "https://media.gucci.com/style/HEXFBFBFB_South_0_160_640x640/1741174256/812656_AAEX4_5817_001_100_0000_Light.jpg",
    category: "Women",
    stock: 15
  },
  {
    name: "Women's Nike Air Max Pulse",
    description: "Modern athletic sneakers with innovative Air Max cushioning technology. Features breathable mesh upper, responsive foam midsole, and contemporary design for all-day comfort and performance.",
    price: 13995,
    image: "https://static.nike.com/a/images/t_PDP_936_v1/f_auto,q_auto:eco/b517f0af-5143-4958-9cea-2760f2301798/W+NIKE+AIR+MAX+PULSE.png",
    category: "Women",
    stock: 35
  },
  {
    name: "Royal Ruby Stiletto Collection",
    description: "Breathtaking stilettos featuring rare ruby gemstones set in 18K white gold hardware. These exclusive heels showcase master craftsmanship with hand-stitched Italian leather and a signature red sole finish.",
    price: 145000,
    image: "https://cdn.luxe.digital/media/20220322140028/most-expensive-shoes-list-ranking-luxe-digital.jpg",
    category: "Women",
    stock: 3
  },
  {
    name: "Champagne Shimmer Evening Pumps",
    description: "Luxurious champagne-hued pumps embellished with Swarovski crystals and metallic threading. The perfect fusion of elegance and glamour with a contoured footbed for maximum comfort during evening soirées.",
    price: 87000,
    image: "https://images.prestigeonline.com/wp-content/uploads/sites/6/2023/05/03205231/most-expensive-shoes-1.jpg?tr=w-1200,h-900",
    category: "Women",
    stock: 7
  },
  {
    name: "Platinum Pearl Ankle-Strap Heels",
    description: "Sophisticated ankle-strap heels adorned with genuine freshwater pearls and platinum-finish buckle. Features cushioned insoles and architectural heel design for ultimate elegance and stability.",
    price: 94000,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5Hda-xAlNUfnF0eEizF06fnOY5ziOnlptog&s",
    category: "Women",
    stock: 9
  },
  {
    name: "Silk Ribbon Luxury Courts",
    description: "Timeless court heels featuring hand-dyed silk ribbon details and delicate embroidery. Crafted from premium satin with a structured heel and elegant pointed toe for a sophisticated silhouette.",
    price: 72000,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQClk82nnx7Tb4HRt0s9qoMroPOqIFYiBEPyg&s",
    category: "Women",
    stock: 11
  },
  {
    name: "Celestial Star Embellished Heels",
    description: "Dazzling heels featuring hand-applied star motifs in crystals and gold leaf. These show-stopping sandals combine artistic expression with luxury, featuring adjustable straps and cushioned arch support.",
    price: 105000,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCml0Mv7NxlnqxjZwxSbfGqs4PTFYaL5EyCN44s6PoN4-RLbiA8GnEKTtkbdEp40_CJPg&usqp=CAU",
    category: "Women",
    stock: 5
  },

  {
    name: "Executive Black Leather Oxfords",
    description: "Premium handcrafted black leather Oxford shoes with a glossy finish. Perfect for corporate professionals, featuring Goodyear welt construction, cushioned leather insoles, and a sleek silhouette for boardroom confidence.",
    price: 8500,
    image: "https://static.toiimg.com/thumb/msid-117104378,width-1280,height-720,imgsize-30058,resizemode-6,overlay-toi_sw,pt-32,y_pad-40/photo.jpg",
    category: "Men",
    stock: 22
  },
  {
    name: "Classic Brown Derby Shoes",
    description: "Sophisticated brown leather Derby shoes with traditional brogue detailing. Crafted from full-grain leather with a comfortable fit, flexible sole, and timeless design suitable for both formal and smart-casual occasions.",
    price: 7200,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCZvSLhrLi5dRWPwvEJ-OxCQWllSsh39AA6UweOCC20GbbHTz_Iwc5hKtyy6Ekt_fx4U4&usqp=CAU",
    category: "Men",
    stock: 18
  },
  {
    name: "Tan Suede Monk Strap Shoes",
    description: "Elegant tan suede monk strap shoes with double buckle closure. Features premium suede upper, leather lining, and cushioned footbed for all-day comfort. A refined choice for the modern gentleman.",
    price: 9800,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxPTixDzsAZF0HIH0DO1JJZT5gotyY84i4FDHzppqREU_ygo8K8iVwr13ZoRpz0P2BCZI&usqp=CAU",
    category: "Men",
    stock: 15
  },
  {
    name: "Cognac Leather Brogues",
    description: "Distinguished cognac leather brogues with intricate wingtip perforations. Hand-finished with premium Italian leather, memory foam insoles, and durable rubber outsoles for exceptional style and comfort.",
    price: 8900,
    image: "https://viver-myexlusive-server.s3.ap-south-1.amazonaws.com/blog/wp-content/uploads/2024/12/03072813/CompressJPEG.Online_1_100kb_1690-1024x591.jpg",
    category: "Men",
    stock: 20
  },
  {
    name: "Navy Blue Formal Loafers",
    description: "Sleek navy blue leather loafers with a contemporary slip-on design. Perfect for business-casual settings, featuring soft leather construction, padded collar, and a lightweight sole for effortless sophistication.",
    price: 6500,
    image: "https://img.tatacliq.com/images/i25//437Wx649H/MP000000025622635_437Wx649H_202507200846101.jpeg",
    category: "Men",
    stock: 25
  },
  {
    name: "Burgundy Patent Leather Dress Shoes",
    description: "Bold burgundy patent leather dress shoes with a high-shine finish. These statement shoes feature a pointed toe, leather lining, and cushioned insoles, ideal for weddings and formal evening events.",
    price: 10500,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1BRoPSGWwGUFHwgX6C9zO99AHIZIK37fuvmTLWLCuHu2jz1I-CaTmgL0taVcLXYU2KN4&usqp=CAU",
    category: "Men",
    stock: 12
  },
  {
    name: "Chocolate Brown Chelsea Boots",
    description: "Versatile chocolate brown leather Chelsea boots with elastic side panels. Combining rugged durability with refined style, these boots feature a comfortable ankle fit, grippy sole, and water-resistant treatment.",
    price: 11200,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQisI1GEioh8RoYO-uQpr1JLVb4pRnrCAx1vg&s",
    category: "Men",
    stock: 16
  },
  {
    "name": "Midnight Black Chronograph Watch",
    "description": "A polished chronograph men's watch with a deep black dial and luminous hands. Features a stainless steel bracelet, multiple sub-dials for stopwatch functionality, and water resistance ideal for everyday wear or formal occasions.",
    "price": 7200,
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6GiSc1Vq4DvuSnpYTYhhpSGdWbw85Ie9ulA&s",
    "category": "Men",
    "stock": 7
  },
  {
    "name": "Heritage Gold-Tone Analog Watch",
    "description": "Classic gold-tone analog watch with a bold sunburst dial and luminous markers. This timeless timepiece has a premium brown leather strap and date display, perfectly blending elegance and tradition.",
    "price": 8300,
    "image": "https://5.imimg.com/data5/SELLER/Default/2021/11/AS/ER/OD/6094942/jm396-1--500x500.jpg",
    "category": "Men",
    "stock": 10
  },
  {
    "name": "Urban Blue Sport Wristwatch",
    "description": "Sporty blue wristwatch designed for active lifestyles. Featuring a lightweight resin case, bold digital-analog display, stopwatch, alarm functions, and a durable silicone band for comfort.",
    "price": 6500,
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsPUQOPnDMw5Zj2yOQC43VxM8crWbdaG1vzg&s",
    "category": "Men",
    "stock": 12
  },
  {
    "name": "Steel Accent Minimalist Watch",
    "description": "A minimalist men's watch with a brushed steel bezel and monochrome display. Fitted with a sleek mesh strap, it offers understated sophistication for business or casual collections.",
    "price": 7800,
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSs4sVoHrdIAAqEN8iGkJHYFjGrwJB7W9GWmQ&s",
    "category": "Men",
    "stock": 6
  },
  {
    "name": "Noir Carbon Racer Chrono",
    "description": "Sport-inspired black chronograph with bold contrasting sub-dials, luminous markers, and a robust stainless steel case. Perfect for active men who appreciate precision and an urban sporty look.",
    "price": 9900,
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6GiSc1Vq4DvuSnpYTYhhpSGdWbw85Ie9ulA&s",
    "category": "Men",
    "stock": 12
  },
  {
    "name": "Royal Heritage Leather Watch",
    "description": "Timeless gold-tone round dial with brown genuine leather strap. Classic analog movement and an elegantly simple design for a touch of refinement in formal and business settings.",
    "price": 8500,
    "image": "https://5.imimg.com/data5/SELLER/Default/2021/11/AS/ER/OD/6094942/jm396-1--500x500.jpg",
    "category": "Men",
    "stock": 10
  },
  {
    "name": "Blue Nitro Tech Digital",
    "description": "Dynamic blue sports watch with a digital-analog hybrid display, resin case, stopwatch timer, and night-light function. Rugged construction for daily workouts and outdoor adventures.",
    "price": 6800,
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsPUQOPnDMw5Zj2yOQC43VxM8crWbdaG1vzg&s",
    "category": "Men",
    "stock": 17
  },
  {
    "name": "Urban Stainless Steel Classic",
    "description": "Minimalist silver dial watch featuring a stainless steel mesh bracelet and monochrome numeric markers. The slim case ensures lightness and gentlemanly appeal for every occasion.",
    "price": 7250,
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSs4sVoHrdIAAqEN8iGkJHYFjGrwJB7W9GWmQ&s",
    "category": "Men",
    "stock": 8
  },
  {
    "name": "Matte Black Edge Watch",
    "description": "A bold matte black square-faced watch with luminous baton hands and chronograph subdials. Its tough resin strap and oversized design make a statement for any casual outing.",
    "price": 5750,
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtW0E3itYQnQDbmonHfcbJ5Kvfi_Ke7QOG_w&s",
    "category": "Men",
    "stock": 11
  },
  {
    "name": "Titanium Blue Executive",
    "description": "Striking blue dial encased in ultra-light titanium with a stainless-steel bracelet. Features day/date window and water resistance, ideal for the boardroom or evening events.",
    "price": 10900,
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNWsGqImcDRdcc3BFVja0cMbw38gtD2NQUFQ&s",
    "category": "Men",
    "stock": 6
  },
  {
    "name": "Breitling Navitimer Automatic",
    "description": "Luxury aviation-style watch with multi-function chronograph dials, luminous hands, and sturdy metal bracelet. Emblematic of traditional Swiss craftsmanship and technical excellence.",
    "price": 228000,
    "image": "https://www.swisswatchexpo.com/images/all-brands-breitling.jpg",
    "category": "Men",
    "stock": 2
  },
  {
    "name": "Richard Mille Skeleton Dial",
    "description": "Ultra-premium skeletonized watch from Richard Mille. Exposed mechanics, signature tonneau case, and unique blend of innovative materials for true connoisseurs and collectors.",
    "price": 3700000,
    "image": "https://media.gq.com/photos/681272e959b1e7deb3a24357/3:4/w_748%2Cc_limit/richard-mille-RM-30-01-watch.jpg",
    "category": "Men",
    "stock": 1
  },
  {
    "name": "Rose Gold Opulence Automatic",
    "description": "Lavish rose gold automatic watch with multi-faceted bezel, intricate dial pattern, and see-through sapphire caseback. Exudes exclusivity for special occasions and luxury gifting.",
    "price": 495000,
    "image": "https://cdn.businessday.ng/wp-content/uploads/2024/10/IMG_0938.jpeg",
    "category": "Men",
    "stock": 3
  },
  {
    "name": "Richard Mille Red Ceramic Limited",
    "description": "Rare Richard Mille with a red ceramic case, skeleton movement, transparent case back, and sport-inspired accents. A masterpiece for collectors seeking the top tier of modern watchmaking.",
    "price": 8500000,
    "image": "https://blog.sothebysrealty.co.uk/hs-fs/hubfs/Most%20Expensive%20Richard%20Mille%20Watches%20Ever.jpg?width=1000&height=667&name=Most%20Expensive%20Richard%20Mille%20Watches%20Ever.jpg",
    "category": "Men",
    "stock": 1
  },
  {
    "name": "Jetmaster Dual-Tone Sports Watch",
    "description": "Sleek dual-tone chronograph featuring a deep black dial highlighted by bold gold accents. Advanced stopwatch, 24-hour function, and a dynamic rubber-strap design make it the perfect choice for both sports and style.",
    "price": 13500,
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRpQjcNjla44TexMnAk3kf2QNu1Hr34NqAcg&s",
    "category": "Men",
    "stock": 7
  },
  {
    "name": "Navigator Compass Field Watch",
    "description": "Military-inspired field watch in classic olive green, with easy-to-read numerals, compass bezel, and luminous ticking hands. Has a sturdy canvas band suited for adventure and the great outdoors.",
    "price": 5200,
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtW0E3itYQnQDbmonHfcbJ5Kvfi_Ke7QOG_w&s",
    "category": "Men",
    "stock": 14
  },
  {
    "name": "Silver Mesh Date Watch",
    "description": "Modern silver case and mesh band paired with minimalist dot hour markers. An understated date window completes the look, crafted for those who appreciate modern simplicity and elegance.",
    "price": 6400,
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNWsGqImcDRdcc3BFVja0cMbw38gtD2NQUFQ&s",
    "category": "Men",
    "stock": 18
  },
  {
    "name": "Midnight Pulse LED Digital",
    "description": "Retro-futuristic all-black LED digital watch with bold red display numerals, perfect for late-night city wear. Waterproof, rechargeable, and ultra-lightweight for maximum comfort day or night.",
    "price": 4300,
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6GiSc1Vq4DvuSnpYTYhhpSGdWbw85Ie9ulA&s",
    "category": "Men",
    "stock": 22
  },
  {
    "name": "Subzero Sapphire Dive Watch",
    "description": "Professional-grade automatic diver with unidirectional blue bezel and luminous markers. Sapphire crystal, 300m water resistance, and steel bracelet combine performance with a striking look.",
    "price": 19850,
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsPUQOPnDMw5Zj2yOQC43VxM8crWbdaG1vzg&s",
    "category": "Men",
    "stock": 4
  },
  {
    "name": "Breitling Aviator's Dream",
    "description": "Swiss automatic aviator with multi-dial chronograph, rotating bezel, and intricate detailing. Signature Breitling logo, high-polished case, and presentation box included.",
    "price": 249000,
    "image": "https://www.swisswatchexpo.com/images/all-brands-breitling.jpg",
    "category": "Men",
    "stock": 2
  },
  {
    "name": "Richard Mille Vision Skeleton",
    "description": "Ultra-luxury Richard Mille skeleton design showcases mechanical mastery, non-reflective sapphire crystal, titanium case, and unique locking crown.",
    "price": 3100000,
    "image": "https://media.gq.com/photos/681272e959b1e7deb3a24357/3:4/w_748%2Cc_limit/richard-mille-RM-30-01-watch.jpg",
    "category": "Men",
    "stock": 1
  },
  {
    "name": "Golden Opus Automatic",
    "description": "Classic automatic movement, opulent gold-tone casing with ethnic engraving, see-through caseback, and black alligator-texture leather strap.",
    "price": 50300,
    "image": "https://cdn.businessday.ng/wp-content/uploads/2024/10/IMG_0938.jpeg",
    "category": "Men",
    "stock": 2
  },
  {
    "name": "Richard Mille Red Fusion",
    "description": "Limited edition bold red Richard Mille made from advanced ceramics. Chronograph action, transparent caseback, showpiece for collectors.",
    "price": 7850000,
    "image": "https://blog.sothebysrealty.co.uk/hs-fs/hubfs/Most%20Expensive%20Richard%20Mille%20Watches%20Ever.jpg?width=1000&height=667&name=Most%20Expensive%20Richard%20Mille%20Watches%20Ever.jpg",
    "category": "Men",
    "stock": 1
  }


  
 



];

// Seed to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log("🎉 Successfully inserted ");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error connecting to MongoDB:", err.message);
    process.exit(1);
  });
