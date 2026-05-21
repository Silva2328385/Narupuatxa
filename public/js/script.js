// Informações: JS para NextLynx Tech - Handling forms, partilhas, animações e admin com fetch Supabase
document.addEventListener('DOMContentLoaded', () => {

    // 1. FORMS SUBMIT: Contactos, Orçamentos, Newsletter, e Solicitações
    const forms = document.querySelectorAll('form[id^="contact"], .solicitar-form, #newsletter-form, #orcamento-form');
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            const endpoint = form.id === 'newsletter-form' ? '/subscribe' : '/submit';
            
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                alert(result.message || 'Operação realizada com sucesso!');
                form.reset();
            } catch (err) {
                alert('Erro no envio: ' + err.message);
            }
        });
    });

    // 2. PARTILHAS SOCIAIS: WhatsApp e Facebook
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const url = window.location.href;
            const text = document.title;
            if (btn.dataset.platform === 'whatsapp') {
                window.open(`https://wa.me/258868187201?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
            } else if (btn.dataset.platform === 'facebook') {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
            }
        });
    });

    // 3. ANIMAÇÕES SCROLL: Intersection Observer
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible'); // Usa a tua classe CSS de animação
            }
        });
    });
    document.querySelectorAll('.animate-on-scroll, .animate-slide-up, .animate-fade-in, .service-card').forEach(el => {
        observer.observe(el);
    });

    // 4. ASSETS DINÂMICOS: Agora com "Mentoria Académica"
    if (document.querySelector('#servicos-page') || document.querySelector('#portfolio-page')) {
        // ATUALIZADO: Nomes devem bater com o banco de dados
        ['Design Gráfico', 'Mentoria Académica', 'Serviços de Tecnologia'].forEach(tipo => {
            loadServiceAssets(tipo);
        });
    }

    async function loadServiceAssets(servico_tipo) {
        try {
            const res = await fetch(`/api/assets/${encodeURIComponent(servico_tipo)}`);
            const assets = await res.json();
            
            // Normaliza o ID para encontrar o container: "Mentoria Académica" vira "assets-mentoria-academica"
            const containerId = `assets-${servico_tipo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-')}`;
            const container = document.getElementById(containerId) || document.getElementById(containerId + '-portfolio');
            
            if (container) {
                container.innerHTML = ''; // Limpa antes de carregar
                assets.forEach(a => {
                    let html = '';
                    if (a.tipo_ficheiro === 'imagem') {
                        html = `<img src="${a.ficheiro_url}" alt="${a.nome_ficheiro}" class="img-fluid mb-2 animate-fade-in" style="max-width: 200px;">`;
                    } else if (a.tipo_ficheiro === 'pdf') {
                        html = `<a href="${a.ficheiro_url}" class="btn btn-outline-primary me-2 mb-2 btn-bounce" target="_blank">📄 ${a.nome_ficheiro}</a>`;
                    } else if (a.tipo_ficheiro === 'video') {
                        html = `<video src="${a.ficheiro_url}" controls class="w-100 mb-2 animate-fade-in" style="max-height: 200px;"></video>`;
                    }
                    container.innerHTML += html;
                });
            }
        } catch (err) {
            console.error('Erro ao carregar assets:', err);
        }
    }

    // 5. LÓGICA ADMIN
    if (window.location.pathname.includes('admin')) {
        
        async function loadPedidos() {
            const res = await fetch('/api/pedidos');
            const pedidos = await res.json();
            const tbody = document.querySelector('#tabela-pedidos tbody');
            if (tbody) tbody.innerHTML = '';
            
            let total = 0, countDesign = 0, countAcademicos = 0, countTech = 0;

            pedidos.forEach(p => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${p.id.slice(0,8)}</td>
                    <td>${p.nome}</td>
                    <td>${p.email}</td>
                    <td>${p.servico}</td>
                    <td><span class="badge bg-${p.status === 'Aprovado' ? 'success' : 'warning'}">${p.status}</span></td>
                    <td>${new Date(p.created_at).toLocaleDateString('pt-PT')}</td>
                    <td>
                        <button class="btn btn-sm btn-info edit-btn" data-id="${p.id}" data-status="${p.status}">Editar</button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${p.id}">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(tr);
                
                total++;
                // ATUALIZADO: Matching das estatísticas com o novo nome
                if (p.servico === 'Design Gráfico') countDesign++;
                else if (p.servico === 'Mentoria Académica') countAcademicos++;
                else if (p.servico === 'Serviços de Tecnologia') countTech++;
            });

            document.getElementById('total-pedidos').textContent = total;
            document.getElementById('count-design').textContent = countDesign;
            document.getElementById('count-academicos').textContent = countAcademicos;
            document.getElementById('count-tech').textContent = countTech;
        }

        // ... (as restantes funções de loadEmails e loadAssets permanecem iguais)
        loadPedidos();
        loadEmails();
        loadAssets();
    }
});