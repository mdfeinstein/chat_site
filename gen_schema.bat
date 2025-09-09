cd C:\Users\Mati\Documents\chat_site
python manage.py spectacular --file schema.json
npx openapi-typescript schema.json -o src/api/types.ts