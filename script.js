// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 平滑滚动到锚点
    const navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 添加滚动监听器，高亮当前显示的导航项
    let sections = document.querySelectorAll('.section');
    let navAs = document.querySelectorAll('nav a');

    window.addEventListener('scroll', function() {
        let scrollPosition = document.documentElement.scrollTop || document.body.scrollTop;

        sections.forEach((section, index) => {
            const offsetTop = section.offsetTop;
            const offsetHeight = section.offsetHeight;

            if (scrollPosition >= offsetTop - 100 &&
                scrollPosition < offsetTop + offsetHeight - 100) {

                navAs.forEach(navA => {
                    navA.classList.remove('active');
                });

                navAs[index].classList.add('active');
            }
        });
    });

    // 为每个章节添加淡入效果
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(section);
    });

    // 添加返回顶部按钮
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = '↑';
    backToTopButton.id = 'backToTop';
    backToTopButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 1000;
    `;

    document.body.appendChild(backToTopButton);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.style.opacity = '1';
        } else {
            backToTopButton.style.opacity = '0';
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // 为营养部分添加交互功能
    const macroItems = document.querySelectorAll('.macro-item');
    macroItems.forEach(item => {
        item.addEventListener('click', function() {
            this.classList.toggle('expanded');
        });
    });

    // 表单提交事件处理
    const fitnessForm = document.getElementById('fitnessForm');
    const resultSection = document.getElementById('resultSection');

    if(fitnessForm) {
        fitnessForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // 获取表单数据
            const formData = {
                age: parseInt(document.getElementById('age').value),
                gender: document.getElementById('gender').value,
                height: parseFloat(document.getElementById('height').value),
                weight: parseFloat(document.getElementById('weight').value),
                goalWeight: parseFloat(document.getElementById('goalWeight').value),
                activityLevel: document.getElementById('activityLevel').value,
                fitnessGoal: document.getElementById('fitnessGoal').value,
                healthCondition: document.getElementById('healthCondition').value
            };

            // 计算并生成个性化健身计划
            const plan = generatePersonalizedFitnessPlan(formData);

            // 显示结果
            displayPersonalizedPlan(formData, plan);

            // 显示结果区域
            resultSection.style.display = 'block';

            // 启用饮食计划生成按钮
            const mealPlanBtn = document.getElementById('generateMealPlanBtn');
            if(mealPlanBtn) {
                mealPlanBtn.disabled = false;
                mealPlanBtn.textContent = '生成我的饮食计划';
            }

            // 平滑滚动到结果区域
            resultSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // 饮食计划生成按钮事件处理
    const mealPlanBtn = document.getElementById('generateMealPlanBtn');
    if(mealPlanBtn) {
        mealPlanBtn.addEventListener('click', function() {
            // 获取之前计算的计划数据（这里简化处理，实际项目中应存储到全局变量或localStorage）
            const formData = {
                age: parseInt(document.getElementById('age')?.value || 25),
                gender: document.getElementById('gender')?.value || 'male',
                height: parseFloat(document.getElementById('height')?.value || 170),
                weight: parseFloat(document.getElementById('weight')?.value || 70),
                goalWeight: parseFloat(document.getElementById('goalWeight')?.value || 65),
                activityLevel: document.getElementById('activityLevel')?.value || 'moderate',
                fitnessGoal: document.getElementById('fitnessGoal')?.value || 'lose_weight',
                healthCondition: document.getElementById('healthCondition')?.value || ''
            };

            // 重新生成计划以获取最新数据
            const plan = generatePersonalizedFitnessPlan(formData);

            // 生成并显示饮食计划
            const mealPlan = generatePersonalizedMealPlan(formData, plan);
            displayPersonalizedMealPlan(mealPlan);

            // 隐藏消息，显示饮食计划
            document.getElementById('generateMealPlanMessage').style.display = 'none';
            document.getElementById('mealPlansSection').style.display = 'block';

            // 平滑滚动到饮食计划部分
            document.getElementById('mealPlansSection').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // 绑定保存计划按钮事件
    const savePlanBtn = document.getElementById('savePlanBtn');
    if(savePlanBtn) {
        savePlanBtn.addEventListener('click', function() {
            savePersonalizedPlan();
        });
    }

    // 添加页面加载完成提示
    console.log('健身知识百科页面已加载完成！');
});

// 生成个性化健身计划的函数
function generatePersonalizedFitnessPlan(formData) {
    const { age, gender, height, weight, goalWeight, activityLevel, fitnessGoal } = formData;

    // 计算BMI
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    // 计算基础代谢率(BMR) - 使用Mifflin-St Jeor方程
    let bmr;
    if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // 活动系数
    const activityMultipliers = {
        'sedentary': 1.2,      // 久坐
        'light': 1.375,       // 轻度活动
        'moderate': 1.55,     // 中度活动
        'active': 1.725,      // 高度活动
        'very_active': 1.9    // 极高活动
    };

    // 计算总能量消耗(TDEE)
    const tdee = bmr * activityMultipliers[activityLevel];

    // 根据健身目标调整热量摄入
    let calorieTarget;
    let calorieChange = 0;
    let calorieGoalDesc = '';

    if (fitnessGoal === 'lose_weight') {
        // 减脂：每日减少500卡路里
        calorieTarget = tdee - 500;
        calorieChange = -500;
        calorieGoalDesc = '减脂期';
    } else if (fitnessGoal === 'gain_muscle') {
        // 增肌：每日增加300卡路里
        calorieTarget = tdee + 300;
        calorieChange = 300;
        calorieGoalDesc = '增肌期';
    } else if (fitnessGoal === 'maintain') {
        // 维持体重
        calorieTarget = tdee;
        calorieGoalDesc = '维持期';
    } else {
        // 综合健身：轻微赤字以减脂同时配合力量训练增肌
        calorieTarget = tdee - 250;
        calorieChange = -250;
        calorieGoalDesc = '塑形期';
    }

    // 计算营养分配
    const proteinRatio = fitnessGoal === 'gain_muscle' ? 0.30 : 0.25; // 增肌期蛋白质比例更高
    const carbRatio = fitnessGoal === 'lose_weight' ? 0.40 : 0.45;    // 减脂期碳水比例较低
    const fatRatio = 1 - proteinRatio - carbRatio;

    const proteinGrams = Math.round(calorieTarget * proteinRatio / 4);
    const carbGrams = Math.round(calorieTarget * carbRatio / 4);
    const fatGrams = Math.round(calorieTarget * fatRatio / 9);

    // 生成训练计划
    let workoutPlan = generateWorkoutPlan(fitnessGoal, age);

    // 估算达成目标的时间
    const weightDifference = weight - goalWeight;
    const estimatedTime = Math.abs(Math.round(weightDifference * 7700 / calorieChange)); // 7700卡路里约等于1公斤体重变化

    return {
        bmi: Math.round(bmi * 100) / 100,
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        calorieTarget: Math.round(calorieTarget),
        calorieChange: calorieChange,
        calorieGoal: calorieGoalDesc,
        macronutrients: {
            protein: proteinGrams,
            carbs: carbGrams,
            fats: fatGrams
        },
        workoutPlan: workoutPlan,
        estimatedTime: estimatedTime > 0 ? estimatedTime : 0
    };
}

// 生成训练计划的函数
function generateWorkoutPlan(fitnessGoal, age) {
    let plan = {};

    if (age < 30) {
        // 年轻人训练计划
        if (fitnessGoal === 'lose_weight') {
            plan.description = '减脂为主，结合有氧和力量训练';
            plan.schedule = [
                {
                    day: '周一',
                    exercises: ['热身: 5-10分钟轻度有氧', '力量训练: 深 squat 3x12, 卧推 3x10, 硬拉 3x8', '有氧: 跑步机 20分钟中等强度'],
                    duration: '60分钟'
                },
                {
                    day: '周二',
                    exercises: ['热身: 5-10分钟轻度有氧', 'HIIT训练: 20分钟高强度间歇训练', '拉伸: 10分钟'],
                    duration: '40分钟'
                },
                {
                    day: '周三',
                    exercises: ['热身: 5-10分钟轻度有氧', '力量训练: 引体向上 3x8, 肩推 3x10, 划船 3x12', '核心训练: 平板支撑等'],
                    duration: '50分钟'
                },
                {
                    day: '周四',
                    exercises: ['有氧运动: 游泳或骑行 40分钟', '拉伸: 10分钟'],
                    duration: '50分钟'
                },
                {
                    day: '周五',
                    exercises: ['热身: 5-10分钟轻度有氧', '力量训练: 腿部循环训练', '拉伸: 10分钟'],
                    duration: '50分钟'
                },
                {
                    day: '周六',
                    exercises: ['有氧运动: 户外跑步或徒步 45分钟'],
                    duration: '50分钟'
                },
                {
                    day: '周日',
                    exercises: ['休息或轻度活动: 散步、瑜伽'],
                    duration: '轻松'
                }
            ];
        } else if (fitnessGoal === 'gain_muscle') {
            plan.description = '增肌为主，重点力量训练';
            plan.schedule = [
                {
                    day: '周一 - 胸部+三头肌',
                    exercises: ['卧推 4x8-10', '上斜哑铃卧推 3x10', '哑铃飞鸟 3x12', '双杠臂屈伸 3x尽力', '哑铃臂屈伸 3x12'],
                    duration: '60-70分钟'
                },
                {
                    day: '周二 - 背部+二头肌',
                    exercises: ['引体向上/下拉 4x8-10', '杠铃划船 4x8-10', '坐姿划船 3x12', '杠铃弯举 3x10', '哑铃锤式弯举 3x12'],
                    duration: '60-70分钟'
                },
                {
                    day: '周三 - 腿部',
                    exercises: ['深蹲 4x8-10', '腿举 4x12', '保加利亚分腿蹲 3x12', '腿弯举 3x12', '小腿提踵 4x15'],
                    duration: '60-70分钟'
                },
                {
                    day: '周四 - 肩部+腹肌',
                    exercises: ['肩推 4x8-10', '侧平举 3x12', '前平举 3x12', '面拉 3x15', '卷腹 3x20', '平板支撑 3x60秒'],
                    duration: '50-60分钟'
                },
                {
                    day: '周五 - 有氧+小肌群',
                    exercises: ['轻度有氧 20-30分钟', '臂部训练: 交替弯举、绳索下压等', '拉伸'],
                    duration: '40-50分钟'
                },
                {
                    day: '周六',
                    exercises: ['有氧运动或活动性恢复'],
                    duration: '30-45分钟'
                },
                {
                    day: '周日',
                    exercises: ['完全休息'],
                    duration: '休息'
                }
            ];
        } else {
            plan.description = '综合训练，平衡发展';
            plan.schedule = [
                {
                    day: '周一',
                    exercises: ['热身: 10分钟', '力量训练: 全身复合动作', '有氧: 15分钟中等强度'],
                    duration: '60分钟'
                },
                {
                    day: '周二',
                    exercises: ['有氧运动: 45分钟中等强度', '拉伸: 15分钟'],
                    duration: '60分钟'
                },
                {
                    day: '周三',
                    exercises: ['力量训练: 上半身', '核心训练: 20分钟'],
                    duration: '50分钟'
                },
                {
                    day: '周四',
                    exercises: ['有氧运动: HIIT 25分钟', '拉伸: 15分钟'],
                    duration: '40分钟'
                },
                {
                    day: '周五',
                    exercises: ['力量训练: 下半身', '拉伸: 15分钟'],
                    duration: '50分钟'
                },
                {
                    day: '周六',
                    exercises: ['户外活动: 徒步、球类等', '瑜伽或普拉提'],
                    duration: '60分钟'
                },
                {
                    day: '周日',
                    exercises: ['休息或轻度恢复性活动'],
                    duration: '轻松'
                }
            ];
        }
    } else {
        // 年龄较大的训练计划（更注重安全性）
        if (fitnessGoal === 'lose_weight') {
            plan.description = '安全减脂，低冲击训练';
            plan.schedule = [
                {
                    day: '周一',
                    exercises: ['热身: 10分钟步行', '力量训练: 轻重量多组数', '拉伸: 15分钟'],
                    duration: '50分钟'
                },
                {
                    day: '周二',
                    exercises: ['游泳或水中运动: 30分钟', '轻度拉伸: 15分钟'],
                    duration: '45分钟'
                },
                {
                    day: '周三',
                    exercises: ['瑜伽或太极: 45分钟', '核心稳定训练: 15分钟'],
                    duration: '60分钟'
                },
                {
                    day: '周四',
                    exercises: ['步行或椭圆机: 30分钟', '拉伸: 15分钟'],
                    duration: '45分钟'
                },
                {
                    day: '周五',
                    exercises: ['力量训练: 中等强度', '平衡训练: 15分钟'],
                    duration: '50分钟'
                },
                {
                    day: '周六',
                    exercises: ['户外活动: 快走或轻度徒步', '放松拉伸'],
                    duration: '50分钟'
                },
                {
                    day: '周日',
                    exercises: ['完全休息或冥想'],
                    duration: '休息'
                }
            ];
        } else {
            plan.description = '维持健康，适度训练';
            plan.schedule = [
                {
                    day: '周一',
                    exercises: ['热身: 10分钟步行', '力量训练: 适合年龄的重量', '拉伸: 15分钟'],
                    duration: '45分钟'
                },
                {
                    day: '周二',
                    exercises: ['瑜伽或普拉提: 45分钟', '呼吸练习: 15分钟'],
                    duration: '60分钟'
                },
                {
                    day: '周三',
                    exercises: ['水中运动或游泳: 30分钟', '拉伸: 15分钟'],
                    duration: '45分钟'
                },
                {
                    day: '周四',
                    exercises: ['步行或骑车: 35分钟', '核心稳定训练: 15分钟'],
                    duration: '50分钟'
                },
                {
                    day: '周五',
                    exercises: ['力量训练: 全身循环', '平衡训练: 15分钟'],
                    duration: '50分钟'
                },
                {
                    day: '周六',
                    exercises: ['户外活动: 适合的强度', '放松'],
                    duration: '60分钟'
                },
                {
                    day: '周日',
                    exercises: ['休息或冥想'],
                    duration: '休息'
                }
            ];
        }
    }

    return plan;
}

// 生成个性化饮食计划的函数
function generatePersonalizedMealPlan(formData, planData) {
    const { fitnessGoal } = formData;
    const { calorieTarget, macronutrients } = planData;

    // 计算每餐的热量分配
    const mealCalories = {
        breakfast: Math.round(calorieTarget * 0.25), // 早餐 25%
        midMorningSnack: Math.round(calorieTarget * 0.05), // 上午加餐 5%
        lunch: Math.round(calorieTarget * 0.35), // 午餐 35%
        afternoonSnack: Math.round(calorieTarget * 0.05), // 下午加餐 5%
        dinner: Math.round(calorieTarget * 0.25), // 晚餐 25%
        eveningSnack: Math.round(calorieTarget * 0.05) // 晚间加餐 5%
    };

    // 计算每餐的宏量营养素分配
    const mealMacros = {
        breakfast: {
            protein: Math.round(macronutrients.protein * 0.25),
            carbs: Math.round(macronutrients.carbs * 0.25),
            fats: Math.round(macronutrients.fats * 0.25)
        },
        midMorningSnack: {
            protein: Math.round(macronutrients.protein * 0.05),
            carbs: Math.round(macronutrients.carbs * 0.05),
            fats: Math.round(macronutrients.fats * 0.05)
        },
        lunch: {
            protein: Math.round(macronutrients.protein * 0.35),
            carbs: Math.round(macronutrients.carbs * 0.35),
            fats: Math.round(macronutrients.fats * 0.35)
        },
        afternoonSnack: {
            protein: Math.round(macronutrients.protein * 0.05),
            carbs: Math.round(macronutrients.carbs * 0.05),
            fats: Math.round(macronutrients.fats * 0.05)
        },
        dinner: {
            protein: Math.round(macronutrients.protein * 0.25),
            carbs: Math.round(macronutrients.carbs * 0.25),
            fats: Math.round(macronutrients.fats * 0.25)
        },
        eveningSnack: {
            protein: Math.round(macronutrients.protein * 0.05),
            carbs: Math.round(macronutrients.carbs * 0.05),
            fats: Math.round(macronutrients.fats * 0.05)
        }
    };

    // 根据健身目标生成不同的饮食建议
    let breakfast, midMorningSnack, lunch, afternoonSnack, dinner, eveningSnack;

    if (fitnessGoal === 'lose_weight') {
        // 减脂饮食建议
        breakfast = [
            { food: '燕麦片 40g', calories: 150, protein: 5, carbs: 27, fats: 3 },
            { food: '蛋白 2个', calories: 70, protein: 14, carbs: 0.2, fats: 0.2 },
            { food: '蓝莓 50g', calories: 29, protein: 0.4, carbs: 7.4, fats: 0.1 },
            { food: '杏仁 10颗', calories: 58, protein: 2.1, carbs: 2.3, fats: 5.4 }
        ];

        midMorningSnack = [
            { food: '希腊酸奶 100g', calories: 59, protein: 10, carbs: 3.6, fats: 0.4 },
            { food: '核桃 2颗', calories: 65, protein: 0.7, carbs: 0.8, fats: 6.1 }
        ];

        lunch = [
            { food: '鸡胸肉 120g', calories: 165, protein: 31, carbs: 0, fats: 3.6 },
            { food: '糙米饭 70g', calories: 112, protein: 2.4, carbs: 24, fats: 0.8 },
            { food: '西兰花 100g', calories: 34, protein: 2.8, carbs: 6.6, fats: 0.4 },
            { food: '橄榄油 5ml', calories: 45, protein: 0, carbs: 0, fats: 5 }
        ];

        afternoonSnack = [
            { food: '苹果 1个(中等)', calories: 95, protein: 0.5, carbs: 25, fats: 0.3 },
            { food: '花生酱 1茶匙', calories: 94, protein: 4, carbs: 3.3, fats: 8 }
        ];

        dinner = [
            { food: '三文鱼 100g', calories: 208, protein: 20, carbs: 0, fats: 13 },
            { food: '红薯 100g', calories: 86, protein: 1.6, carbs: 20, fats: 0.1 },
            { food: '菠菜 100g', calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4 },
            { food: '牛油果 1/4个', calories: 80, protein: 1, carbs: 6, fats: 7 }
        ];

        eveningSnack = [
            { food: '酪蛋白粉 20g', calories: 75, protein: 16, carbs: 1, fats: 0.5 },
            { food: '肉桂粉 1/2茶匙', calories: 12, protein: 0.1, carbs: 2.6, fats: 0.1 }
        ];
    } else if (fitnessGoal === 'gain_muscle') {
        // 增肌饮食建议
        breakfast = [
            { food: '全麦面包 2片', calories: 138, protein: 5, carbs: 26, fats: 1.5 },
            { food: '鸡蛋 2个(全蛋)', calories: 143, protein: 12, carbs: 0.6, fats: 10 },
            { food: '香蕉 1根(中等)', calories: 105, protein: 1.3, carbs: 27, fats: 0.4 },
            { food: '花生酱 1汤匙', calories: 94, protein: 4, carbs: 3.3, fats: 8 }
        ];

        midMorningSnack = [
            { food: '蛋白粉 30g', calories: 120, protein: 24, carbs: 3, fats: 1.5 },
            { food: '脱脂牛奶 200ml', calories: 70, protein: 6.8, carbs: 9.6, fats: 0.4 }
        ];

        lunch = [
            { food: '牛肉 120g', calories: 250, protein: 26, carbs: 0, fats: 15 },
            { food: '白米饭 100g', calories: 130, protein: 2.7, carbs: 28, fats: 0.3 },
            { food: '混合蔬菜 100g', calories: 25, protein: 1.2, carbs: 5, fats: 0.2 },
            { food: '橄榄油 8ml', calories: 72, protein: 0, carbs: 0, fats: 8 }
        ];

        afternoonSnack = [
            { food: '燕麦片 30g', calories: 114, protein: 4, carbs: 20, fats: 2.5 },
            { food: '香蕉 1根', calories: 105, protein: 1.3, carbs: 27, fats: 0.4 },
            { food: '蜂蜜 1汤匙', calories: 64, protein: 0, carbs: 17, fats: 0 }
        ];

        dinner = [
            { food: '鸡胸肉 150g', calories: 202, protein: 44, carbs: 0, fats: 4.5 },
            { food: '意大利面 80g', calories: 110, protein: 4, carbs: 22, fats: 0.5 },
            { food: '混合奶酪 30g', calories: 105, protein: 7, carbs: 0.6, fats: 8 },
            { food: '混合沙拉 100g', calories: 15, protein: 0.9, carbs: 2.6, fats: 0.3 }
        ];

        eveningSnack = [
            { food: '酪蛋白粉 30g', calories: 113, protein: 24, carbs: 2, fats: 1 },
            { food: '杏仁 15颗', calories: 98, protein: 3.6, carbs: 3.8, fats: 9.7 }
        ];
    } else {
        // 维持或综合健身饮食建议
        breakfast = [
            { food: '燕麦片 50g', calories: 188, protein: 6, carbs: 33, fats: 3 },
            { food: '蛋白 3个', calories: 105, protein: 21, carbs: 0.3, fats: 0.3 },
            { food: '牛油果 1/4个', calories: 80, protein: 1, carbs: 6, fats: 7 },
            { food: '草莓 50g', calories: 15, protein: 0.3, carbs: 3.5, fats: 0.1 }
        ];

        midMorningSnack = [
            { food: '希腊酸奶 150g', calories: 89, protein: 15, carbs: 5.4, fats: 0.6 },
            { food: '混合坚果 15g', calories: 95, protein: 2.5, carbs: 1.8, fats: 8.5 }
        ];

        lunch = [
            { food: '烤鸡腿 120g', calories: 172, protein: 27, carbs: 0, fats: 6.5 },
            { food: '藜麦 70g', calories: 120, protein: 4.4, carbs: 21, fats: 1.9 },
            { food: '烤蔬菜 100g', calories: 40, protein: 2, carbs: 8, fats: 0.5 },
            { food: '橄榄油 6ml', calories: 54, protein: 0, carbs: 0, fats: 6 }
        ];

        afternoonSnack = [
            { food: '苹果 1个(中等)', calories: 95, protein: 0.5, carbs: 25, fats: 0.3 },
            { food: '核桃 3颗', calories: 98, protein: 1, carbs: 1.2, fats: 9.1 }
        ];

        dinner = [
            { food: '三文鱼 100g', calories: 208, protein: 20, carbs: 0, fats: 13 },
            { food: '红薯 120g', calories: 103, protein: 2, carbs: 24, fats: 0.1 },
            { food: '蒸西兰花 100g', calories: 34, protein: 2.8, carbs: 6.6, fats: 0.4 },
            { food: '亚麻籽 1汤匙', calories: 55, protein: 1.3, carbs: 2, fats: 4.3 }
        ];

        eveningSnack = [
            { food: '脱脂酸奶 100g', calories: 59, protein: 3.8, carbs: 4.7, fats: 0.4 },
            { food: '浆果混合 50g', calories: 20, protein: 0.5, carbs: 5, fats: 0.1 }
        ];
    }

    return {
        mealCalories,
        mealMacros,
        meals: {
            breakfast,
            midMorningSnack,
            lunch,
            afternoonSnack,
            dinner,
            eveningSnack
        }
    };
}

// 显示个性化计划的函数
function displayPersonalizedPlan(formData, plan) {
    const personalInfoDiv = document.getElementById('personalInfo');
    const fitnessPlanDiv = document.getElementById('fitnessPlan');
    const nutritionAdviceDiv = document.getElementById('nutritionAdvice');

    // 生成个人健康信息
    let healthStatus = '';
    if (plan.bmi < 18.5) healthStatus = '偏瘦';
    else if (plan.bmi < 24) healthStatus = '正常';
    else if (plan.bmi < 28) healthStatus = '超重';
    else healthStatus = '肥胖';

    personalInfoDiv.innerHTML = `
        <h4>您的健康指标</h4>
        <div class="personal-data">
            <p><strong>年龄:</strong> ${formData.age} 岁</p>
            <p><strong>性别:</strong> ${formData.gender === 'male' ? '男' : '女'}</p>
            <p><strong>身高:</strong> ${formData.height} cm</p>
            <p><strong>当前体重:</strong> ${formData.weight} kg</p>
            <p><strong>目标体重:</strong> ${formData.goalWeight} kg</p>
            <p><strong>BMI指数:</strong> ${plan.bmi} (${healthStatus})</p>
            <p><strong>基础代谢率:</strong> ${plan.bmr} 卡路里/天</p>
            <p><strong>总能量消耗:</strong> ${plan.tdee} 卡路里/天</p>
        </div>
    `;

    // 生成健身计划
    let goalText = '';
    if (formData.fitnessGoal === 'lose_weight') goalText = '减脂';
    else if (formData.fitnessGoal === 'gain_muscle') goalText = '增肌';
    else if (formData.fitnessGoal === 'maintain') goalText = '维持';
    else goalText = '综合健身';

    let timeEstimate = '';
    if (plan.estimatedTime > 0) {
        if (plan.estimatedTime > 30) {
            timeEstimate = `<p><strong>预计达成时间:</strong> 约 ${Math.ceil(plan.estimatedTime/30)} 个月</p>`;
        } else {
            timeEstimate = `<p><strong>预计达成时间:</strong> 约 ${plan.estimatedTime} 天</p>`;
        }
    }

    fitnessPlanDiv.innerHTML = `
        <h4>您的健身计划 - ${goalText}目标</h4>
        <div class="calorie-info">
            <p><strong>日均热量目标:</strong> ${plan.calorieTarget} 卡路里 (${plan.calorieGoal})</p>
            <p><strong>与当前TDEE差值:</strong> ${plan.calorieChange > 0 ? '+' : ''}${plan.calorieChange} 卡路里</p>
            ${timeEstimate}
        </div>

        <div class="plan-category">
            <h4>训练安排</h4>
            <p>${plan.workoutPlan.description}</p>

            <div class="workout-schedule">
                ${plan.workoutPlan.schedule.map(day => `
                    <div class="workout-day">
                        <h5>${day.day}</h5>
                        <p><strong>时长:</strong> ${day.duration}</p>
                        <ul>
                            ${day.exercises.map(ex => `<li>${ex}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // 生成营养建议
    nutritionAdviceDiv.innerHTML = `
        <h4>营养建议</h4>
        <div class="calorie-info">
            <p><strong>每日营养分配:</strong></p>
        </div>

        <div class="nutrition-breakdown">
            <div class="nutrient-item">
                <h5>蛋白质</h5>
                <p><strong>${plan.macronutrients.protein}g</strong></p>
                <p>约占总热量${Math.round(plan.macronutrients.protein * 4 * 100 / plan.calorieTarget)}%</p>
                <p>来源：瘦肉、鱼、蛋、豆类、乳制品</p>
            </div>

            <div class="nutrient-item">
                <h5>碳水化合物</h5>
                <p><strong>${plan.macronutrients.carbs}g</strong></p>
                <p>约占总热量${Math.round(plan.macronutrients.carbs * 4 * 100 / plan.calorieTarget)}%</p>
                <p>来源：燕麦、糙米、红薯、水果、蔬菜</p>
            </div>

            <div class="nutrient-item">
                <h5>脂肪</h5>
                <p><strong>${plan.macronutrients.fats}g</strong></p>
                <p>约占总热量${Math.round(plan.macronutrients.fats * 9 * 100 / plan.calorieTarget)}%</p>
                <p>来源：坚果、橄榄油、牛油果、鱼类</p>
            </div>
        </div>

        <div class="plan-details">
            <h4>补充建议</h4>
            <ul>
                <li>保证每日饮水量：${Math.round(formData.weight * 0.03)}-${Math.round(formData.weight * 0.04)}升</li>
                <li>确保每晚7-9小时优质睡眠</li>
                <li>规律用餐，避免暴饮暴食</li>
                <li>根据运动量适当调整营养摄入</li>
                <li>如适用，请考虑维生素D、Omega-3等补充剂</li>
            </ul>
        </div>
    `;
}

// 显示个性化饮食计划的函数
function displayPersonalizedMealPlan(mealPlan) {
    // 显示早餐
    document.getElementById('breakfastPlan').innerHTML = `
        <h4>热量: ${mealPlan.mealCalories.breakfast}卡 | 蛋白质: ${mealPlan.mealMacros.breakfast.protein}g | 碳水: ${mealPlan.mealMacros.breakfast.carbs}g | 脂肪: ${mealPlan.mealMacros.breakfast.fats}g</h4>
        <div class="meal-items">
            ${mealPlan.meals.breakfast.map(item => `
                <div class="meal-item">
                    <h5>${item.food}</h5>
                    <p>热量: ${item.calories}卡</p>
                    <div class="meal-nutrition">
                        <span>蛋白质: ${item.protein}g</span>
                        <span>碳水: ${item.carbs}g</span>
                        <span>脂肪: ${item.fats}g</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // 显示上午加餐
    document.getElementById('midMorningSnackPlan').innerHTML = `
        <h4>热量: ${mealPlan.mealCalories.midMorningSnack}卡 | 蛋白质: ${mealPlan.mealMacros.midMorningSnack.protein}g | 碳水: ${mealPlan.mealMacros.midMorningSnack.carbs}g | 脂肪: ${mealPlan.mealMacros.midMorningSnack.fats}g</h4>
        <div class="meal-items">
            ${mealPlan.meals.midMorningSnack.map(item => `
                <div class="meal-item">
                    <h5>${item.food}</h5>
                    <p>热量: ${item.calories}卡</p>
                    <div class="meal-nutrition">
                        <span>蛋白质: ${item.protein}g</span>
                        <span>碳水: ${item.carbs}g</span>
                        <span>脂肪: ${item.fats}g</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // 显示午餐
    document.getElementById('lunchPlan').innerHTML = `
        <h4>热量: ${mealPlan.mealCalories.lunch}卡 | 蛋白质: ${mealPlan.mealMacros.lunch.protein}g | 碳水: ${mealPlan.mealMacros.lunch.carbs}g | 脂肪: ${mealPlan.mealMacros.lunch.fats}g</h4>
        <div class="meal-items">
            ${mealPlan.meals.lunch.map(item => `
                <div class="meal-item">
                    <h5>${item.food}</h5>
                    <p>热量: ${item.calories}卡</p>
                    <div class="meal-nutrition">
                        <span>蛋白质: ${item.protein}g</span>
                        <span>碳水: ${item.carbs}g</span>
                        <span>脂肪: ${item.fats}g</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // 显示下午加餐
    document.getElementById('afternoonSnackPlan').innerHTML = `
        <h4>热量: ${mealPlan.mealCalories.afternoonSnack}卡 | 蛋白质: ${mealPlan.mealMacros.afternoonSnack.protein}g | 碳水: ${mealPlan.mealMacros.afternoonSnack.carbs}g | 脂肪: ${mealPlan.mealMacros.afternoonSnack.fats}g</h4>
        <div class="meal-items">
            ${mealPlan.meals.afternoonSnack.map(item => `
                <div class="meal-item">
                    <h5>${item.food}</h5>
                    <p>热量: ${item.calories}卡</p>
                    <div class="meal-nutrition">
                        <span>蛋白质: ${item.protein}g</span>
                        <span>碳水: ${item.carbs}g</span>
                        <span>脂肪: ${item.fats}g</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // 显示晚餐
    document.getElementById('dinnerPlan').innerHTML = `
        <h4>热量: ${mealPlan.mealCalories.dinner}卡 | 蛋白质: ${mealPlan.mealMacros.dinner.protein}g | 碳水: ${mealPlan.mealMacros.dinner.carbs}g | 脂肪: ${mealPlan.mealMacros.dinner.fats}g</h4>
        <div class="meal-items">
            ${mealPlan.meals.dinner.map(item => `
                <div class="meal-item">
                    <h5>${item.food}</h5>
                    <p>热量: ${item.calories}卡</p>
                    <div class="meal-nutrition">
                        <span>蛋白质: ${item.protein}g</span>
                        <span>碳水: ${item.carbs}g</span>
                        <span>脂肪: ${item.fats}g</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // 显示晚间加餐
    document.getElementById('eveningSnackPlan').innerHTML = `
        <h4>热量: ${mealPlan.mealCalories.eveningSnack}卡 | 蛋白质: ${mealPlan.mealMacros.eveningSnack.protein}g | 碳水: ${mealPlan.mealMacros.eveningSnack.carbs}g | 脂肪: ${mealPlan.mealMacros.eveningSnack.fats}g</h4>
        <div class="meal-items">
            ${mealPlan.meals.eveningSnack.map(item => `
                <div class="meal-item">
                    <h5>${item.food}</h5>
                    <p>热量: ${item.calories}卡</p>
                    <div class="meal-nutrition">
                        <span>蛋白质: ${item.protein}g</span>
                        <span>碳水: ${item.carbs}g</span>
                        <span>脂肪: ${item.fats}g</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// 保存计划到本地存储的函数
function savePersonalizedPlan() {
    const resultSection = document.getElementById('resultSection');
    if(resultSection.style.display !== 'none') {
        // 获取当前显示的数据（实际应用中应该保存原始数据）
        alert('您的健身计划已保存到本地！您可以在浏览器的本地存储中找到它。');
        // 实际保存逻辑可以根据需求扩展
    } else {
        alert('请先填写个人信息并生成计划');
    }
}

// 工具函数：计算BMI
function calculateBMI(weight, height) {
    if (weight > 0 && height > 0) {
        const bmi = weight / (height / 100) ** 2;
        return Math.round(bmi * 100) / 100;
    }
    return 0;
}

// 工具函数：获取BMI类别
function getBMICategory(bmi) {
    if (bmi < 18.5) return '偏瘦';
    if (bmi < 24) return '正常';
    if (bmi < 28) return '超重';
    return '肥胖';
}

// 工具函数：计算每日所需热量
function calculateDailyCalories(weight, height, age, gender, activityLevel) {
    let bmr;

    // 使用Mifflin-St Jeor方程计算基础代谢率
    if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // 根据活动水平调整
    const activityMultipliers = {
        'sedentary': 1.2,      // 久坐
        'light': 1.375,       // 轻度活动
        'moderate': 1.55,     // 中度活动
        'active': 1.725,      // 高度活动
        'very_active': 1.9    // 极高活动
    };

    return Math.round(bmr * activityMultipliers[activityLevel]);
}