document.addEventListener('DOMContentLoaded', function() {
    const avatarUpload = document.getElementById('avatar-upload');
    const avatarImage = document.getElementById('profile-avatar');
    
    // 添加防抖函数
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // 优化文件处理函数
    const handleFile = async (file) => {
        try {
            // 文件类型检查
            if (!file.type.match('image.*')) {
                throw new Error('请上传图片文件！');
            }
            
            // 文件大小检查
            const MAX_SIZE = 2 * 1024 * 1024; // 2MB
            if (file.size > MAX_SIZE) {
                throw new Error('图片大小不能超过 2MB！');
            }
            
            // 图片压缩处理
            const compressedImage = await compressImage(file);
            return compressedImage;
        } catch (error) {
            alert(error.message);
            return null;
        }
    };
    
    // 图片压缩函数
    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // 计算压缩后的尺寸
                    let width = img.width;
                    let height = img.height;
                    const MAX_WIDTH = 500;
                    
                    if (width > MAX_WIDTH) {
                        height = Math.round((height * MAX_WIDTH) / width);
                        width = MAX_WIDTH;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };
    
    // 处理头像上传
    avatarUpload.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const compressedImage = await handleFile(file);
        if (compressedImage) {
            avatarImage.classList.add('changing');
            avatarImage.src = compressedImage;
            
            try {
                localStorage.setItem('userAvatar', compressedImage);
            } catch (error) {
                console.warn('无法保存头像到本地存储：', error);
            }
        }
    });
    
    // 恢复保存的头像
    try {
        const savedAvatar = localStorage.getItem('userAvatar');
        if (savedAvatar) {
            avatarImage.src = savedAvatar;
        }
    } catch (error) {
        console.warn('无法读取保存的头像：', error);
    }
    
    // 优化头像加载动画
    avatarImage.addEventListener('load', debounce(function() {
        requestAnimationFrame(() => {
            avatarImage.classList.remove('changing');
        });
    }, 300));
    
    // 侧边栏收起功能
    const sideNav = document.querySelector('.side-nav');
    const sideNavToggle = document.querySelector('.side-nav-toggle');
    const main = document.querySelector('main');
    
    // 从 localStorage 获取侧边栏状态
    const isSideNavCollapsed = localStorage.getItem('sideNavCollapsed') === 'true';
    if (isSideNavCollapsed) {
        sideNav.classList.add('collapsed');
        main.style.marginRight = '0';
    }
    
    sideNavToggle.addEventListener('click', function() {
        sideNav.classList.toggle('collapsed');
        
        // 更新主内容区域的边距
        if (sideNav.classList.contains('collapsed')) {
            main.style.marginRight = '0';
            localStorage.setItem('sideNavCollapsed', 'true');
        } else {
            main.style.marginRight = window.innerWidth > 1024 ? '300px' : '250px';
            localStorage.setItem('sideNavCollapsed', 'false');
        }
    });
    
    // 响应窗口大小变化
    window.addEventListener('resize', function() {
        if (!sideNav.classList.contains('collapsed') && window.innerWidth > 768) {
            main.style.marginRight = window.innerWidth > 1024 ? '300px' : '250px';
        }
    });

    // 工具库功能
    const addToolBtn = document.getElementById('addToolBtn');
    const addToolModal = document.getElementById('addToolModal');
    const addToolForm = document.getElementById('addToolForm');
    const toolsGrid = document.querySelector('.tools-grid');

    // 知识库相关元素
    const addKnowledgeBtn = document.getElementById('addKnowledgeBtn');
    const addKnowledgeModal = document.getElementById('addKnowledgeModal');
    const addKnowledgeForm = document.getElementById('addKnowledgeForm');
    const knowledgeGrid = document.querySelector('.knowledge-grid');

    // 方法库相关元素
    const addMethodBtn = document.getElementById('addMethodBtn');
    const addMethodModal = document.getElementById('addMethodModal');
    const addMethodForm = document.getElementById('addMethodForm');
    const methodsGrid = document.querySelector('.methods-grid');

    // 从 localStorage 获取保存的工具
    const savedTools = JSON.parse(localStorage.getItem('customTools') || '[]');
    
    // 渲染保存的工具
    savedTools.forEach(tool => addToolToGrid(tool));

    // 通用的打开模态框函数
    function openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // 通用的关闭模态框函数
    function closeModal(modal, form) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        if (form) form.reset();
    }

    // 添加模态框打开事件监听器
    addToolBtn.addEventListener('click', () => openModal(addToolModal));
    addKnowledgeBtn.addEventListener('click', () => {
        console.log('Knowledge button clicked');
        if (!addKnowledgeModal) {
            console.error('Knowledge modal not found');
            return;
        }
        openModal(addKnowledgeModal);
        console.log('Knowledge modal opened');
    });
    addMethodBtn.addEventListener('click', () => openModal(addMethodModal));

    // 为所有模态框添加关闭功能
    const modals = [
        { modal: addToolModal, form: addToolForm },
        { modal: addKnowledgeModal, form: addKnowledgeForm },
        { modal: addMethodModal, form: addMethodForm }
    ];

    modals.forEach(({ modal, form }) => {
        const closeBtn = modal.querySelector('.close-modal');
        const cancelBtn = modal.querySelector('.cancel-btn');

        closeBtn.addEventListener('click', () => closeModal(modal, form));
        cancelBtn.addEventListener('click', () => closeModal(modal, form));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal, form);
        });
    });

    // 检查元素是否正确获取
    console.log('Knowledge button:', addKnowledgeBtn);
    console.log('Knowledge modal:', addKnowledgeModal);

    // 图标选择器
    const selectedIcon = document.querySelector('.selected-icon');
    const iconList = document.querySelector('.icon-list');

    selectedIcon.addEventListener('click', () => {
        iconList.classList.toggle('active');
    });

    iconList.addEventListener('click', (e) => {
        if (e.target.tagName === 'I') {
            const iconClass = e.target.className;
            selectedIcon.innerHTML = `<i class="${iconClass}"></i>`;
            iconList.classList.remove('active');
        }
    });

    // 添加文件转换函数
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // 处理工具库表单提交
    addToolForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const categorySelect = addToolForm.querySelector('.category-select');
        const linkValue = document.getElementById('toolLink').value.trim();
        const newTool = {
            id: Date.now().toString(),
            icon: selectedIcon.querySelector('i').className,
            name: document.getElementById('toolName').value.trim(),
            description: document.getElementById('toolDesc').value.trim(),
            link: linkValue || null,
            category: categorySelect ? categorySelect.value : null
        };

        // 添加到网格
        addToolToGrid(newTool);

        // 保存到 localStorage
        const savedTools = JSON.parse(localStorage.getItem('customTools') || '[]');
        savedTools.push(newTool);
        localStorage.setItem('customTools', JSON.stringify(savedTools));

        // 关闭模态框
        closeModal(addToolModal, addToolForm);
        
        // 显示成功提示
        showToast('添加成功');
    });

    // 修改知识库表单提交处理
    addKnowledgeForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const file = document.getElementById('knowledgeFiles').files[0];
        const categorySelect = addKnowledgeForm.querySelector('.category-select');
        const linkValue = document.getElementById('knowledgeLink').value.trim();
        const newKnowledge = {
            id: Date.now().toString(),
            title: document.getElementById('knowledgeTitle').value.trim(),
            description: document.getElementById('knowledgeDesc').value.trim(),
            link: linkValue || null,
            category: categorySelect ? categorySelect.value : null,
            fileName: file ? file.name : null,
            fileData: file ? await fileToBase64(file) : null
        };

        // 添加到网格
        addKnowledgeToGrid(newKnowledge);

        // 保存到 localStorage
        const savedKnowledge = JSON.parse(localStorage.getItem('customKnowledge') || '[]');
        savedKnowledge.push(newKnowledge);
        localStorage.setItem('customKnowledge', JSON.stringify(savedKnowledge));

        // 关闭模态框
        closeModal(addKnowledgeModal, addKnowledgeForm);
        
        // 显示成功提示
        showToast('添加成功');
    });

    // 修改方法库表单提交处理
    addMethodForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const file = document.getElementById('methodFiles').files[0];
        const categorySelect = addMethodForm.querySelector('.category-select');
        const linkValue = document.getElementById('methodLink').value.trim();
        const newMethod = {
            id: Date.now().toString(),
            icon: document.querySelector('#addMethodModal .selected-icon i').className,
            title: document.getElementById('methodTitle').value.trim(),
            items: document.getElementById('methodItems').value
                .split('\n')
                .map(item => item.trim())
                .filter(item => item),
            link: linkValue || null,
            category: categorySelect ? categorySelect.value : null,
            fileName: file ? file.name : null,
            fileData: file ? await fileToBase64(file) : null
        };

        // 添加到网格
        addMethodToGrid(newMethod);

        // 保存到 localStorage
        const savedMethods = JSON.parse(localStorage.getItem('customMethods') || '[]');
        savedMethods.push(newMethod);
        localStorage.setItem('customMethods', JSON.stringify(savedMethods));

        // 关闭模态框
        closeModal(addMethodModal, addMethodForm);
        
        // 显示成功提示
        showToast('添加成功');
    });

    // 添加工具到网格
    function addToolToGrid(tool) {
        const toolElement = document.createElement('div');
        toolElement.className = 'tool-item';
        if (tool.category) {
            toolElement.setAttribute('data-category', tool.category);
        }
        toolElement.innerHTML = `
            <div class="tool-icon">
                <i class="${tool.icon}"></i>
            </div>
            <h3>${tool.name}</h3>
            <p>${tool.description}</p>
            ${tool.link ? `<a href="${tool.link}" class="tool-link" target="_blank">
                使用工具 <i class="fas fa-arrow-right"></i>
            </a>` : ''}
            <button class="item-edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="item-delete">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // 添加编辑按钮的事件监听器
        const editBtn = toolElement.querySelector('.item-edit');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showEditModal('tool', tool, toolElement);
        });
        
        // 添加删除按钮的事件监听器
        const deleteBtn = toolElement.querySelector('.item-delete');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showDeleteConfirmation(toolElement);
        });
        
        toolsGrid.appendChild(toolElement);
    }

    // 从 localStorage 获取保存的数据
    const savedKnowledge = JSON.parse(localStorage.getItem('customKnowledge') || '[]');
    const savedMethods = JSON.parse(localStorage.getItem('customMethods') || '[]');

    // 渲染保存的数据
    savedKnowledge.forEach(item => addKnowledgeToGrid(item));
    savedMethods.forEach(item => addMethodToGrid(item));

    // 添加知识到网格
    function addKnowledgeToGrid(knowledge) {
        // 确保知识项目有ID
        if (!knowledge.id) {
            knowledge.id = Date.now().toString();
        }
        
        const element = document.createElement('div');
        element.className = 'knowledge-item new';
        element.setAttribute('data-id', knowledge.id); // 添加ID属性到DOM元素
        if (knowledge.category) {
            element.setAttribute('data-category', knowledge.category);
        }
        element.innerHTML = `
            <h3>${knowledge.title}</h3>
            <p>${knowledge.description}</p>
            ${FileUtils.getFileDisplayHTML(knowledge.fileName)}
            ${knowledge.link ? `<a href="${knowledge.link}" class="item-link" target="_blank">
                <i class="fas fa-external-link-alt"></i>查看相关链接
            </a>` : ''}
            <button class="item-edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="item-delete">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // 添加编辑按钮的事件监听器
        const editBtn = element.querySelector('.item-edit');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showEditModal('knowledge', knowledge, element);
        });
        
        // 添加删除按钮的事件监听器
        const deleteBtn = element.querySelector('.item-delete');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showDeleteConfirmation(element);
        });
        
        knowledgeGrid.appendChild(element);
        setTimeout(() => element.classList.remove('new'), 500);

        // 修改文件预览功能
        FileUtils.addPreviewHandler(element, knowledge);
    }

    // 添加方法到网格
    function addMethodToGrid(method) {
        // 确保方法有ID
        if (!method.id) {
            method.id = Date.now().toString();
        }
        
        const element = document.createElement('div');
        element.className = 'method-item new';
        element.setAttribute('data-id', method.id); // 添加ID属性到DOM元素
        if (method.category) {
            element.setAttribute('data-category', method.category);
        }
        element.innerHTML = `
            <div class="method-header">
                <i class="${method.icon}"></i>
                <h3>${method.title}</h3>
            </div>
            <div class="method-content">
                <ul>
                    ${method.items.map(item => `<li>${item}</li>`).join('')}
                </ul>
                ${FileUtils.getFileDisplayHTML(method.fileName)}
                ${method.link ? `<a href="${method.link}" class="item-link" target="_blank">
                    <i class="fas fa-external-link-alt"></i>查看相关链接
                </a>` : ''}
            </div>
            <button class="item-edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="item-delete">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // 添加编辑按钮的事件监听器
        const editBtn = element.querySelector('.item-edit');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showEditModal('method', method, element);
        });
        
        // 添加删除按钮的事件监听器
        const deleteBtn = element.querySelector('.item-delete');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showDeleteConfirmation(element);
        });
        
        methodsGrid.appendChild(element);
        setTimeout(() => element.classList.remove('new'), 500);

        // 修改文件预览功能
        FileUtils.addPreviewHandler(element, method);
    }

    // 方法库图标选择器
    const methodIconSelector = document.querySelector('#addMethodModal .selected-icon');
    const methodIconList = document.querySelector('#addMethodModal .icon-list');

    methodIconSelector.addEventListener('click', () => {
        methodIconList.classList.toggle('active');
    });

    methodIconList.addEventListener('click', (e) => {
        if (e.target.tagName === 'I') {
            const iconClass = e.target.className;
            methodIconSelector.innerHTML = `<i class="${iconClass}"></i>`;
            methodIconList.classList.remove('active');
        }
    });

    // 添加分类管理功能
    function initializeCategories(sectionId) {
        const section = document.getElementById(sectionId);
        const grid = section.querySelector(`.${sectionId}-grid`);
        
        // 从 localStorage 获取分类
        const categories = JSON.parse(localStorage.getItem(`${sectionId}Categories`) || '[]');
        
        // 创建分类导航
        const categoryNav = document.createElement('div');
        categoryNav.className = 'category-nav';
        
        // 创建分类列表容器
        const categoryList = document.createElement('div');
        categoryList.className = 'category-list';
        
        // 添加"全部"分类
        const allCategory = document.createElement('div');
        allCategory.className = 'category-item active';
        allCategory.textContent = '全部';
        categoryList.appendChild(allCategory);
        
        // 添加已有分类
        categories.forEach(category => {
            const categoryItem = createCategoryItem(category);
            categoryList.appendChild(categoryItem);
        });
        
        // 添加分类按钮
        const addCategoryBtn = document.createElement('button');
        addCategoryBtn.className = 'category-item add-category';
        addCategoryBtn.innerHTML = '<i class="fas fa-plus"></i> 添加分类';
        categoryList.appendChild(addCategoryBtn);
        
        categoryNav.appendChild(categoryList);
        
        // 检查是否已存在分类导航
        const existingNav = section.querySelector('.category-nav');
        if (existingNav) {
            existingNav.remove();
        }
        
        section.insertBefore(categoryNav, grid);
        
        // 处理分类点击
        categoryList.addEventListener('click', (e) => {
            const categoryItem = e.target.closest('.category-item');
            if (categoryItem && !categoryItem.classList.contains('add-category')) {
                const items = grid.children;
                const category = categoryItem.textContent.trim();
                
                // 更新激活状态
                categoryList.querySelectorAll('.category-item').forEach(item => {
                    item.classList.remove('active');
                });
                categoryItem.classList.add('active');
                
                // 筛选项目
                Array.from(items).forEach(item => {
                    if (category === '全部') {
                        item.style.display = '';
                    } else {
                        const itemCategory = item.getAttribute('data-category');
                        item.style.display = (itemCategory === category) ? '' : 'none';
                    }
                });
            }
        });
        
        // 处理添加分类
        addCategoryBtn.addEventListener('click', () => {
            showAddCategoryModal(sectionId, categories, categoryList);
        });
        
        return categories;
    }

    // 修改创建分类项函数
    function createCategoryItem(category) {
        const item = document.createElement('div');
        item.className = 'category-item';
        item.innerHTML = `
            <div class="category-content">
                ${category.name}
            </div>
            <div class="category-delete" title="删除分类">
                <i class="fas fa-times"></i>
            </div>
        `;
        
        if (category.color) {
            item.style.backgroundColor = category.color;
            item.style.color = 'white';
        }
        
        // 添加删除功能
        const deleteBtn = item.querySelector('.category-delete');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showDeleteConfirm(category, item);
        });
        
        return item;
    }

    // 修改显示添加分类模态框函数
    function showAddCategoryModal(sectionId, categories, categoryList) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>添加新分类</h3>
                    <button class="close-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form class="category-form">
                    <div class="form-group">
                        <label>分类名称</label>
                        <input type="text" required placeholder="请输入分类名称">
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="submit-btn">添加</button>
                        <button type="button" class="cancel-btn">取消</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 0);
        
        // 处理表单提交
        const form = modal.querySelector('form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = form.querySelector('input').value;
            const category = { 
                name, 
                color: '#007bff'
            };
            
            // 更新分类数组
            categories.push(category);
            
            // 更新 localStorage
            localStorage.setItem(`${sectionId}Categories`, JSON.stringify(categories));
            
            // 添加新分类到 DOM
            const categoryItem = createCategoryItem(category);
            const addButton = categoryList.querySelector('.add-category');
            categoryList.insertBefore(categoryItem, addButton);
            
            // 更新表单中的分类选择器
            updateCategorySelects();
            
            // 关闭模态框
            modal.remove();
            
            // 显示成功提示
            showToast('分类添加成功');
        });
        
        // 处理关闭
        const closeBtn = modal.querySelector('.close-modal');
        const cancelBtn = modal.querySelector('.cancel-btn');
        
        [closeBtn, cancelBtn].forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // 修改 addCategorySelectToForm 函数
    function addCategorySelectToForm(form, categories) {
        // 先移除已存在的分类相关元素
        const existingCategoryElements = form.querySelectorAll('.category-form-group');
        existingCategoryElements.forEach(element => element.remove());
        
        // 创建新的分类表单组
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group category-form-group';
        
        // 如果没有分类，显示提示
        if (categories.length === 0) {
            formGroup.innerHTML = `
                <p class="no-category-tip" style="color: #dc3545;">
                    请先添加分类后再添加内容
                </p>
            `;
            form.querySelector('.submit-btn').disabled = true;
        } else {
            // 有分类时显示选择器
            formGroup.innerHTML = `
                <label>选择分类</label>
                <select class="category-select" required>
                    <option value="">请选择分类</option>
                    ${categories.map(category => `
                        <option value="${category.name}" data-color="${category.color}">
                            ${category.name}
                        </option>
                    `).join('')}
                </select>
            `;
            form.querySelector('.submit-btn').disabled = false;
        }
        
        // 插入到表单操作按钮之前
        form.insertBefore(formGroup, form.querySelector('.form-actions'));
    }
    
    // 修改 updateCategorySelects 函数
    function updateCategorySelects() {
        const forms = [
            { form: addKnowledgeForm, type: 'knowledge' },
            { form: addToolForm, type: 'tools' },
            { form: addMethodForm, type: 'methods' }
        ];
        
        forms.forEach(({ form, type }) => {
            const categories = JSON.parse(localStorage.getItem(`${type}Categories`) || '[]');
            addCategorySelectToForm(form, categories);
        });
    }

    // 修改 showDeleteConfirm 函数
    function showDeleteConfirm(category, categoryItem) {
        const sectionId = categoryItem.closest('section').id;
        const modal = document.createElement('div');
        modal.className = 'delete-confirm';
        modal.innerHTML = `
            <h3>删除分类</h3>
            <p>确定要删除分类"${category.name}"吗？该分类下的内容将被移除分类标签。</p>
            <div class="delete-actions">
                <button class="delete-cancel-btn">取消</button>
                <button class="delete-confirm-btn">确定删除</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 0);
        
        // 处理取消
        const cancelBtn = modal.querySelector('.delete-cancel-btn');
        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        // 处理确认删除
        const confirmBtn = modal.querySelector('.delete-confirm-btn');
        confirmBtn.addEventListener('click', () => {
            // 从 localStorage 中删除分类
            const categories = JSON.parse(localStorage.getItem(`${sectionId}Categories`) || '[]');
            const updatedCategories = categories.filter(c => c.name !== category.name);
            localStorage.setItem(`${sectionId}Categories`, JSON.stringify(updatedCategories));
            
            // 更新该分类下的所有内容（移除分类标签而不是删除内容）
            const storageKey = `custom${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}`;
            const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const updatedItems = items.map(item => {
                if (item.category === category.name) {
                    const newItem = { ...item };
                    delete newItem.category;
                    return newItem;
                }
                return item;
            });
            localStorage.setItem(storageKey, JSON.stringify(updatedItems));
            
            // 从 DOM 中移除分类
            categoryItem.remove();
            
            // 更新 DOM 中的项目（移除分类标签）
            const grid = document.querySelector(`.${sectionId}-grid`);
            Array.from(grid.children).forEach(item => {
                if (item.getAttribute('data-category') === category.name) {
                    item.removeAttribute('data-category');
                    const categoryTag = item.querySelector('.item-category');
                    if (categoryTag) {
                        categoryTag.remove();
                    }
                }
            });
            
            // 更新分类选择器
            updateCategorySelects();
            
            // 关闭确认弹窗
            modal.remove();
            
            // 显示删除成功提示
            showToast('分类删除成功');
            
            // 切换到"全部"分类视图
            const allCategoryBtn = document.querySelector(`#${sectionId} .category-item`);
            if (allCategoryBtn) {
                allCategoryBtn.click();
            }
        });
    }

    // 添加提示函数
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 2000);
        }, 100);
    }

    // 添加提示样式
    const style = document.createElement('style');
    style.textContent = `
        .toast {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 0.8rem 1.5rem;
            border-radius: 5px;
            font-size: 0.9rem;
            transition: transform 0.3s ease;
            z-index: 1300;
        }
        
        .toast.show {
            transform: translateX(-50%) translateY(0);
        }
    `;
    document.head.appendChild(style);

    // 初始化各个区域的分类
    const knowledgeCategories = initializeCategories('knowledge');
    const toolCategories = initializeCategories('tools');
    const methodCategories = initializeCategories('methods');
    
    // 更新表单
    updateCategorySelects();

    // 删除内部的 DOMContentLoaded 监听器，直接调用初始化函数
    initializeDeleteFeature();
    
    function initializeDeleteFeature() {
        // 为现有项目添加删除按钮
        const items = document.querySelectorAll('.knowledge-item, .tool-item, .method-item');
        items.forEach(item => {
            if (!item.querySelector('.item-delete')) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'item-delete';
                deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showDeleteConfirmation(item);
                });
                item.appendChild(deleteBtn);
            }
        });

        // 监听新项目的添加
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1 && !node.querySelector('.item-delete')) {
                            const deleteBtn = document.createElement('button');
                            deleteBtn.className = 'item-delete';
                            deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
                            deleteBtn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                showDeleteConfirmation(node);
                            });
                            node.appendChild(deleteBtn);
                        }
                    });
                }
            });
        });

        // 观察所有网格的变化
        const grids = document.querySelectorAll('.knowledge-grid, .tools-grid, .methods-grid');
        grids.forEach(grid => {
            observer.observe(grid, { childList: true });
        });
    }

    // 创建删除确认对话框
    function createDeleteDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'delete-dialog';
        dialog.innerHTML = `
            <h3>确认删除</h3>
            <p>确定要删除这个项目吗？此操作无法撤销。</p>
            <div class="delete-dialog-buttons">
                <button class="cancel-delete">取消</button>
                <button class="confirm-delete">删除</button>
            </div>
        `;
        document.body.appendChild(dialog);
        return dialog;
    }

    // 显示删除确认对话框
    function showDeleteConfirmation(item) {
        const dialog = document.querySelector('.delete-dialog') || createDeleteDialog();
        dialog.classList.add('active');

        const confirmBtn = dialog.querySelector('.confirm-delete');
        const cancelBtn = dialog.querySelector('.cancel-delete');

        // 移除之前的事件监听器
        const newConfirmBtn = confirmBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

        // 添加新的事件监听器
        newConfirmBtn.addEventListener('click', () => {
            deleteItem(item);
            dialog.classList.remove('active');
        });

        newCancelBtn.addEventListener('click', () => {
            dialog.classList.remove('active');
        });

        // 点击对话框外部关闭
        const closeOnOutsideClick = (e) => {
            if (e.target === dialog) {
                dialog.classList.remove('active');
                document.removeEventListener('click', closeOnOutsideClick);
            }
        };
        document.addEventListener('click', closeOnOutsideClick);
    }

    // 修改 deleteItem 函数
    function deleteItem(item) {
        // 确定项目类型
        const type = item.classList.contains('knowledge-item') ? 'knowledge' :
                     item.classList.contains('tool-item') ? 'tools' :
                     'methods';
        
        // 从 localStorage 中获取数据
        const storageKey = `custom${type.charAt(0).toUpperCase() + type.slice(1)}`;
        const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        // 根据不同类型使用不同的匹配条件
        const updatedItems = items.filter(storedItem => {
            if (type === 'knowledge') {
                // 对于知识库项目，使用ID匹配
                return storedItem.id !== item.getAttribute('data-id');
            } else {
                // 对于其他项目，保持原有的标题/名称匹配
                const storedTitle = type === 'tools' ? storedItem.name : storedItem.title;
                const itemTitle = item.querySelector('h3').textContent;
                return storedTitle !== itemTitle;
            }
        });
        
        // 更新 localStorage
        localStorage.setItem(storageKey, JSON.stringify(updatedItems));
        
        // 添加删除动画
        item.style.transform = 'scale(0.9)';
        item.style.opacity = '0';
        
        // 移除元素
        setTimeout(() => {
            item.remove();
        }, 300);
        
        // 显示删除成功提示
        showToast('删除成功');
    }

    // 添加编辑模态框显示函数
    function showEditModal(type, item, element) {
        // 确保 item 有 ID
        if (!item.id) {
            item.id = element.getAttribute('data-id') || Date.now().toString();
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal edit-modal';
        
        let formContent = '';
        switch(type) {
            case 'tool':
                formContent = `
                    <div class="form-group">
                        <label for="editToolIcon">选择图标</label>
                        <div class="icon-selector">
                            <button type="button" class="selected-icon">
                                <i class="${item.icon}"></i>
                            </button>
                            <div class="icon-list">
                                <i class="fas fa-code"></i>
                                <i class="fas fa-file-alt"></i>
                                <i class="fas fa-image"></i>
                                <i class="fas fa-link"></i>
                                <i class="fas fa-calculator"></i>
                                <i class="fas fa-terminal"></i>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="editToolName">工具名称</label>
                        <input type="text" id="editToolName" value="${item.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="editToolDesc">工具描述</label>
                        <textarea id="editToolDesc" required>${item.description}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="editToolLink">工具链接</label>
                        <input type="url" id="editToolLink" value="${item.link || ''}" placeholder="输入工具链接（可选）">
                    </div>
                `;
                break;
            case 'knowledge':
                formContent = `
                    <div class="form-group">
                        <label for="editKnowledgeTitle">标题</label>
                        <input type="text" id="editKnowledgeTitle" value="${item.title}" required>
                    </div>
                    <div class="form-group">
                        <label for="editKnowledgeCategory">分类</label>
                        <select id="editKnowledgeCategory" class="category-select">
                            <option value="">选择分类</option>
                            <option value="frontend" ${item.category === 'frontend' ? 'selected' : ''}>前端开发</option>
                            <option value="backend" ${item.category === 'backend' ? 'selected' : ''}>后端开发</option>
                            <option value="database" ${item.category === 'database' ? 'selected' : ''}>数据库</option>
                            <option value="devops" ${item.category === 'devops' ? 'selected' : ''}>运维部署</option>
                            <option value="other" ${item.category === 'other' ? 'selected' : ''}>其他</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editKnowledgeDesc">描述</label>
                        <textarea id="editKnowledgeDesc" required>${item.description}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="editKnowledgeFiles">上传附件</label>
                        <input type="file" id="editKnowledgeFiles">
                        <label for="editKnowledgeFiles" class="file-upload-label">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <span class="file-name-display">${item.fileName || '选择文件'}</span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label for="editKnowledgeLink">相关链接</label>
                        <input type="url" id="editKnowledgeLink" value="${item.link || ''}" placeholder="输入相关链接（可选）">
                    </div>
                `;
                break;
            case 'method':
                formContent = `
                    <div class="form-group">
                        <label for="editMethodIcon">选择图标</label>
                        <div class="icon-selector">
                            <button type="button" class="selected-icon">
                                <i class="${item.icon}"></i>
                            </button>
                            <div class="icon-list">
                                <i class="fas fa-sitemap"></i>
                                <i class="fas fa-project-diagram"></i>
                                <i class="fas fa-code-branch"></i>
                                <i class="fas fa-cogs"></i>
                                <i class="fas fa-database"></i>
                                <i class="fas fa-network-wired"></i>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="editMethodCategory">分类</label>
                        <select id="editMethodCategory" class="category-select">
                            <option value="">选择分类</option>
                            <option value="algorithm" ${item.category === 'algorithm' ? 'selected' : ''}>算法</option>
                            <option value="architecture" ${item.category === 'architecture' ? 'selected' : ''}>架构</option>
                            <option value="optimization" ${item.category === 'optimization' ? 'selected' : ''}>优化</option>
                            <option value="debug" ${item.category === 'debug' ? 'selected' : ''}>调试</option>
                            <option value="other" ${item.category === 'other' ? 'selected' : ''}>其他</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editMethodTitle">问题</label>
                        <input type="text" id="editMethodTitle" value="${item.title}" required>
                    </div>
                    <div class="form-group">
                        <label for="editMethodItems">详细内容</label>
                        <textarea id="editMethodItems" required>${item.items.join('\n')}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="editMethodFiles">上传附件</label>
                        <input type="file" id="editMethodFiles">
                        <label for="editMethodFiles" class="file-upload-label">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <span class="file-name-display">${item.fileName || '选择文件'}</span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label for="editMethodLink">相关链接</label>
                        <input type="url" id="editMethodLink" value="${item.link || ''}" placeholder="输入相关链接（可选）">
                    </div>
                `;
                break;
        }
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>编辑${type === 'tool' ? '工具' : type === 'knowledge' ? '知识' : '方法'}</h3>
                    <button class="close-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form class="edit-form">
                    ${formContent}
                    <div class="form-actions">
                        <button type="submit" class="submit-btn">保存</button>
                        <button type="button" class="cancel-btn">取消</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 0);
        
        // 处理图标选择器
        const iconSelector = modal.querySelector('.icon-selector');
        if (iconSelector) {
            const selectedIcon = iconSelector.querySelector('.selected-icon');
            const iconList = iconSelector.querySelector('.icon-list');
            
            selectedIcon.addEventListener('click', () => {
                iconList.classList.toggle('active');
            });
            
            iconList.addEventListener('click', (e) => {
                if (e.target.tagName === 'I') {
                    const iconClass = e.target.className;
                    selectedIcon.innerHTML = `<i class="${iconClass}"></i>`;
                    iconList.classList.remove('active');
                }
            });
        }
        
        // 处理表单提交
        const form = modal.querySelector('form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            let editedItem = { ...item, id: item.id };
            
            switch(type) {
                case 'tool':
                    const toolLinkValue = modal.querySelector('#editToolLink').value.trim();
                    editedItem = {
                        ...editedItem,
                        icon: modal.querySelector('.selected-icon i').className,
                        name: modal.querySelector('#editToolName').value.trim(),
                        description: modal.querySelector('#editToolDesc').value.trim(),
                        link: toolLinkValue || null
                    };
                    break;
                case 'knowledge':
                    const knowledgeFile = modal.querySelector('#editKnowledgeFiles').files[0];
                    const knowledgeLinkValue = modal.querySelector('#editKnowledgeLink').value.trim();
                    const knowledgeCategory = modal.querySelector('#editKnowledgeCategory').value;
                    editedItem = {
                        ...editedItem,
                        title: modal.querySelector('#editKnowledgeTitle').value.trim(),
                        description: modal.querySelector('#editKnowledgeDesc').value.trim(),
                        category: knowledgeCategory,
                        link: knowledgeLinkValue || null,
                        fileName: knowledgeFile ? knowledgeFile.name : item.fileName,
                        fileData: knowledgeFile ? await fileToBase64(knowledgeFile) : item.fileData
                    };
                    break;
                case 'method':
                    const methodFile = modal.querySelector('#editMethodFiles').files[0];
                    const methodLinkValue = modal.querySelector('#editMethodLink').value.trim();
                    const methodCategory = modal.querySelector('#editMethodCategory').value;
                    editedItem = {
                        ...editedItem,
                        icon: modal.querySelector('.selected-icon i').className,
                        title: modal.querySelector('#editMethodTitle').value.trim(),
                        category: methodCategory,
                        items: modal.querySelector('#editMethodItems').value
                            .split('\n')
                            .map(item => item.trim())
                            .filter(item => item),
                        link: methodLinkValue || null,
                        fileName: methodFile ? methodFile.name : item.fileName,
                        fileData: methodFile ? await fileToBase64(methodFile) : item.fileData
                    };
                    break;
            }
            
            // 更新 localStorage
            const storageKey = `custom${type.charAt(0).toUpperCase() + type.slice(1)}s`;
            const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            // 使用 ID 查找要更新的项
            const index = items.findIndex(i => i.id === editedItem.id);
            
            if (index !== -1) {
                items[index] = editedItem;
            } else {
                items.push(editedItem);
            }
            
            // 保存回 localStorage
            localStorage.setItem(storageKey, JSON.stringify(items));
            
            // 更新 DOM
            updateItemDisplay(type, element, editedItem);
            
            // 关闭模态框
            modal.remove();
            
            // 显示成功提示
            showToast('修改成功');
        });
        
        // 处理关闭
        const closeBtn = modal.querySelector('.close-modal');
        const cancelBtn = modal.querySelector('.cancel-btn');
        
        [closeBtn, cancelBtn].forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        // 初始化文件上传处理
        if (type === 'knowledge') {
            FileUtils.handleUploadUI('editKnowledgeFiles');
        } else if (type === 'method') {
            FileUtils.handleUploadUI('editMethodFiles');
        }
    }

    // 修改更新显示函数
    function updateItemDisplay(type, element, editedItem) {
        switch(type) {
            case 'tool':
                element.querySelector('.tool-icon i').className = editedItem.icon;
                element.querySelector('h3').textContent = editedItem.name;
                element.querySelector('p').textContent = editedItem.description;
                updateLink(element, editedItem.link, 'tool');
                break;
            case 'knowledge':
                element.setAttribute('data-id', editedItem.id);
                element.querySelector('h3').textContent = editedItem.title;
                element.querySelector('p').textContent = editedItem.description;
                
                // 更新文件显示
                let fileDisplay = element.querySelector('.item-file');
                if (editedItem.fileName) {
                    if (!fileDisplay) {
                        fileDisplay = document.createElement('div');
                        fileDisplay.className = 'item-file';
                        element.insertBefore(fileDisplay, element.querySelector('.item-link, .item-edit'));
                    }
                    fileDisplay.innerHTML = `
                        <i class="fas fa-file"></i>
                        <span>${editedItem.fileName}</span>
                        <a href="#" class="file-preview-link" title="预览文件">
                            <i class="fas fa-eye"></i>
                        </a>
                    `;
                    
                    // 更新预览功能
                    if (editedItem.fileData) {
                        const previewLink = fileDisplay.querySelector('.file-preview-link');
                        previewLink.addEventListener('click', (e) => {
                            e.preventDefault();
                            window.open(editedItem.fileData, '_blank');
                        });
                    }
                } else if (fileDisplay) {
                    fileDisplay.remove();
                }
                
                updateLink(element, editedItem.link, 'knowledge');

                // 更新 localStorage
                const knowledgeItems = JSON.parse(localStorage.getItem('customKnowledge') || '[]');
                const knowledgeIndex = knowledgeItems.findIndex(k => k.id === editedItem.id);
                if (knowledgeIndex !== -1) {
                    knowledgeItems[knowledgeIndex] = editedItem;
                    localStorage.setItem('customKnowledge', JSON.stringify(knowledgeItems));
                }
                break;
            case 'method':
                element.setAttribute('data-id', editedItem.id);
                element.querySelector('.method-header i').className = editedItem.icon;
                element.querySelector('.method-header h3').textContent = editedItem.title;
                element.querySelector('ul').innerHTML = 
                    editedItem.items.map(item => `<li>${item}</li>`).join('');
                
                // 更新文件显示
                let methodFileDisplay = element.querySelector('.item-file');
                if (editedItem.fileName) {
                    if (!methodFileDisplay) {
                        methodFileDisplay = document.createElement('div');
                        methodFileDisplay.className = 'item-file';
                        element.querySelector('.method-content').insertBefore(
                            methodFileDisplay,
                            element.querySelector('.method-content').lastElementChild
                        );
                    }
                    methodFileDisplay.innerHTML = `
                        <i class="fas fa-file"></i>
                        <span>${editedItem.fileName}</span>
                        <a href="#" class="file-preview-link" title="预览文件">
                            <i class="fas fa-eye"></i>
                        </a>
                    `;
                    
                    // 更新预览功能
                    if (editedItem.fileData) {
                        const previewLink = methodFileDisplay.querySelector('.file-preview-link');
                        previewLink.addEventListener('click', (e) => {
                            e.preventDefault();
                            window.open(editedItem.fileData, '_blank');
                        });
                    }
                } else if (methodFileDisplay) {
                    methodFileDisplay.remove();
                }
                
                updateLink(element, editedItem.link, 'method');

                // 更新 localStorage
                const methodItems = JSON.parse(localStorage.getItem('customMethods') || '[]');
                const methodIndex = methodItems.findIndex(m => m.id === editedItem.id);
                if (methodIndex !== -1) {
                    methodItems[methodIndex] = editedItem;
                    localStorage.setItem('customMethods', JSON.stringify(methodItems));
                }
                break;
        }
    }

    // 辅助函数：更新链接
    function updateLink(element, link, type) {
        const existingLink = element.querySelector('.item-link, .tool-link');
        
        // 如果有新链接
        if (link) {
            const linkHTML = type === 'tool' 
                ? `<a href="${link}" class="tool-link" target="_blank">使用工具 <i class="fas fa-arrow-right"></i></a>`
                : `<a href="${link}" class="item-link" target="_blank"><i class="fas fa-external-link-alt"></i>查看相关链接</a>`;

            if (existingLink) {
                // 更新现有链接
                existingLink.href = link;
            } else {
                // 添加新链接
                if (type === 'method') {
                    element.querySelector('.method-content').insertAdjacentHTML('beforeend', linkHTML);
                } else {
                    element.insertAdjacentHTML('beforeend', linkHTML);
                }
            }
        } else if (existingLink) {
            // 如果没有新链接但存在旧链接，移除旧链接
            existingLink.remove();
        }
    }

    // 文件上传处理
    function handleFileUpload(inputId) {
        const fileInput = document.getElementById(inputId);
        const fileLabel = fileInput.nextElementSibling;
        const fileNameDisplay = fileLabel.querySelector('.file-name-display');

        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                fileNameDisplay.textContent = file.name;
            } else {
                fileNameDisplay.textContent = '选择文件';
            }
        });
    }

    // 初始化文件上传处理
    FileUtils.handleUploadUI('knowledgeFiles');
    FileUtils.handleUploadUI('methodFiles');
});

// 文件处理相关的工具函数
const FileUtils = {
    // 文件转Base64
    toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    },

    // 处理文件上传UI
    handleUploadUI(inputId) {
        const fileInput = document.getElementById(inputId);
        const fileLabel = fileInput.nextElementSibling;
        const fileNameDisplay = fileLabel.querySelector('.file-name-display');

        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            fileNameDisplay.textContent = file ? file.name : '选择文件';
        });
    },

    // 添加文件预览功能
    addPreviewHandler(element, item) {
        if (item.fileName && item.fileData) {
            const previewLink = element.querySelector('.file-preview-link');
            if (previewLink) {
                previewLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.open(item.fileData, '_blank');
                });
            }
        }
    },

    // 生成文件显示HTML
    getFileDisplayHTML(fileName) {
        return fileName ? `
            <div class="item-file">
                <i class="fas fa-file"></i>
                <span>${fileName}</span>
                <a href="#" class="file-preview-link" title="预览文件">
                    <i class="fas fa-eye"></i>
                </a>
            </div>
        ` : '';
    }
};

// 数据处理相关的工具函数
const DataUtils = {
    // 更新localStorage
    updateStorage(type, editedItem) {
        const storageKey = `custom${type.charAt(0).toUpperCase() + type.slice(1)}s`;
        const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const index = items.findIndex(i => i.id === editedItem.id);
        
        if (index !== -1) {
            items[index] = editedItem;
        } else {
            items.push(editedItem);
        }
        
        localStorage.setItem(storageKey, JSON.stringify(items));
    },

    // 处理表单数据
    async processFormData(type, formElement) {
        const file = formElement.querySelector('input[type="file"]').files[0];
        const categorySelect = formElement.querySelector('.category-select');
        const linkValue = formElement.querySelector('input[type="url"]').value.trim();

        const baseData = {
            id: Date.now().toString(),
            link: linkValue || null,
            category: categorySelect ? categorySelect.value : null,
            fileName: file ? file.name : null,
            fileData: file ? await FileUtils.toBase64(file) : null
        };

        switch (type) {
            case 'knowledge':
                return {
                    ...baseData,
                    title: formElement.querySelector('#knowledgeTitle').value.trim(),
                    description: formElement.querySelector('#knowledgeDesc').value.trim()
                };
            case 'method':
                return {
                    ...baseData,
                    icon: formElement.querySelector('.selected-icon i').className,
                    title: formElement.querySelector('#methodTitle').value.trim(),
                    items: formElement.querySelector('#methodItems').value
                        .split('\n')
                        .map(item => item.trim())
                        .filter(item => item)
                };
            default:
                return baseData;
        }
    }
};

// 修改表单提交处理
async function handleFormSubmit(e, type) {
    e.preventDefault();
    
    const newItem = await DataUtils.processFormData(type, e.target);
    const gridFunction = type === 'knowledge' ? addKnowledgeToGrid : addMethodToGrid;
    
    gridFunction(newItem);
    DataUtils.updateStorage(type, newItem);
    
    // 关闭模态框并显示提示
    const modal = e.target.closest('.modal');
    closeModal(modal, e.target);
    showToast('添加成功');
}

// 绑定表单提交事件
addKnowledgeForm.addEventListener('submit', e => handleFormSubmit(e, 'knowledge'));
addMethodForm.addEventListener('submit', e => handleFormSubmit(e, 'method'));

// 初始化文件上传处理
FileUtils.handleUploadUI('knowledgeFiles');
FileUtils.handleUploadUI('methodFiles');

// 修改网格项目添加函数
function addKnowledgeToGrid(knowledge) {
    const element = document.createElement('div');
    element.className = 'knowledge-item new';
    element.setAttribute('data-id', knowledge.id);
    if (knowledge.category) {
        element.setAttribute('data-category', knowledge.category);
    }
    
    element.innerHTML = `
        <h3>${knowledge.title}</h3>
        <p>${knowledge.description}</p>
        ${FileUtils.getFileDisplayHTML(knowledge.fileName)}
        ${knowledge.link ? `<a href="${knowledge.link}" class="item-link" target="_blank">
            <i class="fas fa-external-link-alt"></i>查看相关链接
        </a>` : ''}
        <button class="item-edit"><i class="fas fa-edit"></i></button>
        <button class="item-delete"><i class="fas fa-times"></i></button>
    `;
    
    // 添加事件监听器
    element.querySelector('.item-edit').addEventListener('click', e => {
        e.stopPropagation();
        showEditModal('knowledge', knowledge, element);
    });
    
    element.querySelector('.item-delete').addEventListener('click', e => {
        e.stopPropagation();
        showDeleteConfirmation(element);
    });
    
    knowledgeGrid.appendChild(element);
    setTimeout(() => element.classList.remove('new'), 500);
    
    // 添加文件预览功能
    FileUtils.addPreviewHandler(element, knowledge);
} 