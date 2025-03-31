export default function StructuredData() {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "ZimGroceries",
      "url": "https://zimgroceries.co.uk", // Replace with your actual domain
      "logo": "https://zimgroceries.co.uk/logo.png", // Replace with your actual logo URL
      "description": "Authentic Zimbabwean groceries delivered to loved ones back home",
      "sameAs": [
        "https://facebook.com/zimgroceries", // Replace with your actual social media URLs
        "https://twitter.com/zimgroceries",
        "https://instagram.com/zimgroceries"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-234-567-8901", // Replace with your actual contact number
        "contactType": "customer service",
        "availableLanguage": "English"
      }
    };
  
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    );
  }