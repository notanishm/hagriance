# Agriance Contract Generation Engine

A Python Flask-based contract generation system that creates professional agricultural contracts in PDF format.

## Features

- Input forms for farmer and business details
- Farming methods selection (Organic, IPM, Drip Irrigation, etc.)
- Equipment and input provisions
- Payment structure configuration
- Professional PDF output with:
  - Contract numbering
  - Legal clauses
  - Signature blocks for both parties
  - Witness sections

## Installation

```bash
cd contract_engine
pip install -r requirements.txt
```

## Running

```bash
python app.py
```

Then open: http://localhost:5000

## Deploy to Vercel (Serverless)

```bash
pip install vercel
vercel --prod
```

Or use the Vercel Python runtime with this vercel.json:
```json
{
  "builds": [
    {
      "src": "app.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app.py"
    }
  ]
}
```
