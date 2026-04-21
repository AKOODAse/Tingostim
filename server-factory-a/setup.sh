#!/bin/bash
# ============================================================
#  Factory A — json-server setup script
#  Run this on the Factory A machine / VM
#  DevOps skill: server setup, process management, firewall
# ============================================================

set -e

echo ">>> Installing Node.js (if not installed)"
command -v node >/dev/null 2>&1 || {
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
}

echo ">>> Installing json-server and pm2 globally"
sudo npm install -g json-server pm2

echo ">>> Creating factory data directory"
mkdir -p ~/factory-a
cp machines.json ~/factory-a/machines.json

echo ">>> Starting json-server on port 3001 with pm2"
cd ~/factory-a
pm2 start "json-server --watch machines.json --port 3001 --host 0.0.0.0" --name factory-a
pm2 save
pm2 startup   # run the printed command to auto-start on reboot

echo ""
echo ">>> Firewall rules (ufw) — cybersecurity"
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 80/tcp    # HTTP (for cert renewal)
sudo ufw deny 3001/tcp   # Block direct json-server access from outside (Nginx proxies it)
sudo ufw --force enable

echo ""
echo ">>> Nginx reverse proxy config"
sudo apt-get install -y nginx

cat <<'EOF' | sudo tee /etc/nginx/sites-available/factory-a
server {
    listen 80;
    server_name factory-a.yourdomain.com;   # <-- change this

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        # CORS headers — allow the React frontend to fetch
        add_header 'Access-Control-Allow-Origin'  '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type' always;
        if ($request_method = OPTIONS) { return 204; }
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/factory-a /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo ">>> SSL certificate with Let's Encrypt"
sudo apt-get install -y certbot python3-certbot-nginx
# sudo certbot --nginx -d factory-a.yourdomain.com   # uncomment after DNS is set up

echo ""
echo "============================================================"
echo "  Factory A server is running."
echo "  API endpoint: http://localhost:3001/machines"
echo "  After DNS + certbot: https://factory-a.yourdomain.com/machines"
echo ""
echo "  To update machine data:"
echo "    nano ~/factory-a/machines.json"
echo "  (json-server watches the file — changes apply instantly)"
echo "============================================================"
