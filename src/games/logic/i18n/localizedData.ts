import { Language } from './types';
import { WorldId, WorldInfo, Puzzle } from '../types';

export interface LocalizedWorldData {
  title: string;
  subtitle: string;
  description: string;
}

export const LOCALIZED_WORLDS: Record<Language, Record<WorldId, LocalizedWorldData>> = {
  en: {
    1: {
      title: 'World 1: Simple Machines',
      subtitle: 'Obvious Transformations',
      description: 'Learn fundamental machine mechanics with direct mathematical and visual operations.',
    },
    2: {
      title: 'World 2: Pattern Machines',
      subtitle: 'Sequences & Rates',
      description: 'Discover arithmetic, geometric, and accelerating numeric and spatial progressions.',
    },
    3: {
      title: 'World 3: Shape Machines',
      subtitle: 'Symbolic Geometry',
      description: 'Numbers disappear! Manipulate rotations, colors, mirrors, and spatial rearrangements.',
    },
    4: {
      title: 'World 4: Combination Machines',
      subtitle: 'Multi-Stage Logic',
      description: 'The machine executes multiple steps in sequence. Order of operations becomes critical!',
    },
    5: {
      title: 'World 5: Conditional Machines',
      subtitle: 'If / Then Logic',
      description: 'The machine branches behavior depending on input parity, size, or symbol properties.',
    },
    6: {
      title: 'World 6: Hidden Logic',
      subtitle: 'Complex Decision Trees',
      description: 'Formulate deeper hypotheses for intricate multi-conditional rules.',
    },
    7: {
      title: 'World 7: Nested Machines',
      subtitle: 'Pipeline Architecture',
      description: 'Machines connected inside machines. Trace signals through multi-component pipelines.',
    },
    8: {
      title: 'World 8: The Impossible Machine',
      subtitle: 'Ambiguity & Hypothesis Testing',
      description: 'Multiple candidate rules fit existing clues. Design crucial test inputs to isolate the truth.',
    },
  },
  'zh-CN': {
    1: {
      title: '世界 1：简易基础机器',
      subtitle: '直观基础变换',
      description: '掌握机器的核心运行机制，理解基础数学运算与直接数据映射。',
    },
    2: {
      title: '世界 2：数列规律机器',
      subtitle: '序列与变化率',
      description: '探索等差、等比与加速递增的数值演化与空间序列规律。',
    },
    3: {
      title: '世界 3：几何图形机器',
      subtitle: '符号与几何转换',
      description: '数字隐去！操作符号的旋转、镜像、颜色置换与空间重组。',
    },
    4: {
      title: '世界 4：组合流水线机器',
      subtitle: '多阶段复合逻辑',
      description: '机器按顺序执行多个连续步骤，运算先后次序成为破题关键！',
    },
    5: {
      title: '世界 5：条件分支机器',
      subtitle: 'If / Then 条件判断',
      description: '机器依据输入的奇偶、大小或符号属性执行不同的分支运算。',
    },
    6: {
      title: '世界 6：隐匿深层逻辑',
      subtitle: '复杂决策树',
      description: '透过表象构建严谨的复合假设，破解高维条件约束。',
    },
    7: {
      title: '世界 7：嵌套级联机器',
      subtitle: '管线架构追踪',
      description: '机器内部嵌套子机器！追踪数据信号在多级流水线中的状态演变。',
    },
    8: {
      title: '世界 8：不可能机器',
      subtitle: '歧义排除与假说证伪',
      description: '多套假说均符合现有样本。主动设计关键探针输入，证伪错误理论，发现唯一真理。',
    },
  },
  'zh-TW': {
    1: {
      title: '世界 1：簡易基礎機器',
      subtitle: '直觀基礎變換',
      description: '掌握機器的核心運行機制，理解基礎數學運算與直接資料映射。',
    },
    2: {
      title: '世界 2：數列規律機器',
      subtitle: '序列與變化率',
      description: '探索等差、等比與加速遞增的數值演化與空間序列規律。',
    },
    3: {
      title: '世界 3：幾何圖形機器',
      subtitle: '符號與幾何轉換',
      description: '數字隱去！操作符號的旋轉、鏡像、顏色置換與空間重組。',
    },
    4: {
      title: '世界 4：組合管線機器',
      subtitle: '多階段複合邏輯',
      description: '機器依序執行多個連續步驟，運算先後次序成為破題關鍵！',
    },
    5: {
      title: '世界 5：條件分支機器',
      subtitle: 'If / Then 條件判斷',
      description: '機器依據輸入的奇偶、大小或符號屬性執行不同的分支運算。',
    },
    6: {
      title: '世界 6：隱匿深層邏輯',
      subtitle: '複雜決策樹',
      description: '透過表象構建嚴謹的複合假設，破解高維條件約束。',
    },
    7: {
      title: '世界 7：巢狀級聯機器',
      subtitle: '管線架構追蹤',
      description: '機器內部巢狀子機器！追蹤資料訊號在多級管線中的狀態演變。',
    },
    8: {
      title: '世界 8：不可能機器',
      subtitle: '歧義排除與假說證偽',
      description: '多套假說均符合現有樣本。主動設計關鍵探針輸入，證偽錯誤理論，發現唯一真理。',
    },
  },
};

export interface LocalizedPuzzleData {
  title?: string;
  description?: string;
  ruleDescription?: string;
  hints?: [string, string, string];
  explanation?: string;
  ambiguityHypothesisA?: string;
  ambiguityHypothesisB?: string;
}

export const LOCALIZED_PUZZLES: Record<Language, Record<string, LocalizedPuzzleData>> = {
  en: {},
  'zh-CN': {
    'w1-p1': {
      title: '倍增机器',
      description: '观察数字进入机器核心后发生的变化。',
      ruleDescription: '将输入乘以 2 (×2)',
      hints: [
        '观察每组样本中输入与输出的大小对比。',
        '输出数值恰好是输入数值的两倍。',
        '计算 5 × 2 即可得到正确答案。',
      ],
      explanation: '机器会将穿过它的每一个数字翻倍：输入 × 2 = 输出。',
    },
    'w1-p2': {
      title: '加一能量泵',
      description: '能量仓内发生了微小增幅。',
      ruleDescription: '乘以 2 再加 1 (×2 + 1)',
      hints: [
        '先尝试乘以 2，看看与输出的差距。',
        '2 × 2 = 4 (输出为 5)；3 × 2 = 6 (输出为 7)。',
        '将 6 乘以 2 再加上 1。',
      ],
      explanation: '机器将输入乘以 2 后再加 1：(输入 × 2) + 1。',
    },
    'w1-p3': {
      title: '折半分流阀',
      description: '大数值经过机器后明显缩减。',
      ruleDescription: '将输入除以 2 (÷2)',
      hints: [
        '输出明显小于输入。',
        '10 的一半是 5，14 的一半是 7。',
        '将 24 除以 2。',
      ],
      explanation: '机器将每个输入减半：输入 ÷ 2 = 输出。',
    },
    'w1-p4': {
      title: '三倍压缩机',
      description: '数字在核心受到三重聚变。',
      ruleDescription: '乘以 3 (×3)',
      hints: [
        '观察输出增长的倍率。',
        '2 变成 6，4 变成 12。',
        '将 7 乘以 3。',
      ],
      explanation: '机器将每个输入乘以 3：输入 × 3 = 输出。',
    },
    'w2-p1': {
      title: '等差加速器',
      description: '数字序列正按照恒定速率稳步上升。',
      ruleDescription: '输入递增 4 (+4)',
      hints: [
        '比较相邻样本之间的增量差。',
        '每个输出都比输入大 4。',
        '计算 18 + 4。',
      ],
      explanation: '机器给输入加上固定常数 4：输入 + 4 = 输出。',
    },
    'w2-p2': {
      title: '平方能量环',
      description: '输出呈非线性爆发增长。',
      ruleDescription: '输入的平方 (x²)',
      hints: [
        '输出增长非常迅速。',
        '3 变成 9，4 变成 16，5 变成 25。',
        '计算 7 的平方 (7 × 7)。',
      ],
      explanation: '机器将输入乘以自身：输入 × 输入 = 输出。',
    },
    'w2-p3': {
      title: '斐波那契谐振仓',
      description: '序列中前后数字正在发生奇妙交融。',
      ruleDescription: '求序列下一项 (前两项之和)',
      hints: [
        '观察序列中每个数字与前两个数字的关系。',
        '1+1=2, 1+2=3, 2+3=5, 3+5=8。',
        '计算 5 + 8。',
      ],
      explanation: '经典的斐波那契序列，下一项为前两项之和：5 + 8 = 13。',
    },
    'w3-p1': {
      title: '顺时针旋光仪',
      description: '符号在光束中发生空间旋转。',
      ruleDescription: '顺时针旋转 90 度',
      hints: [
        '观察箭头的朝向变化。',
        '向上箭头变成了向右箭头。',
        '向左箭头顺时针旋转 90 度后朝向哪里？',
      ],
      explanation: '机器将所有图形顺时针旋转 90°。',
    },
    'w3-p2': {
      title: '色谱极化器',
      description: '红蓝两极在机器中发生置换。',
      ruleDescription: '红色与蓝色互换',
      hints: [
        '几何形状未变，观察颜色改变。',
        '红色正方形变成了蓝色正方形。',
        '蓝色圆形经过机器后会变成什么颜色？',
      ],
      explanation: '机器将红色变为蓝色，蓝色变为红色。',
    },
    'w3-p3': {
      title: '几何变种器',
      description: '边数似乎在发生规律性递增。',
      ruleDescription: '边数 + 1 (三角形→正方形→五边形)',
      hints: [
        '数一数输入与输出图形的边数。',
        '3条边（三角形）变成 4条边（正方形）。',
        '4条边（正方形）变换后会变成几条边？',
      ],
      explanation: '机器为每一个多边形增加一条边：三角形(3) → 正方形(4) → 五边形(5)。',
    },
    'w4-p1': {
      title: '双阶强化机',
      description: '数字在两个加工舱中连续经过两次处理。',
      ruleDescription: '×2 + 3',
      hints: [
        '先乘再加。尝试倍增后再补足差值。',
        '2 × 2 = 4 (+3 = 7)；4 × 2 = 8 (+3 = 11)。',
        '先将 6 乘以 2，再加上 3。',
      ],
      explanation: '复合流水线：先将输入乘以 2，再加 3。',
    },
    'w4-p2': {
      title: '逆序衰减机',
      description: '先放大，再扣除损耗。',
      ruleDescription: '×3 - 2',
      hints: [
        '输出接近输入的 3 倍，但略微偏小。',
        '2 × 3 = 6 (-2 = 4)；3 × 3 = 9 (-2 = 7)。',
        '组装：[×] [3] [-] [2]。',
      ],
      explanation: '机器先将输入乘以 3，然后减去 2。',
    },
    'w5-p1': {
      title: '奇偶选择器',
      description: '偶数与奇数在核心遭遇了截然不同的命运。',
      ruleDescription: '若为偶数则 ÷2，若为奇数则 ×2',
      hints: [
        '分别看偶数样本（4→2, 6→3）与奇数样本（3→6, 5→10）。',
        '偶数被折半，奇数被翻倍。',
        '7 是奇数，所以应该如何计算？',
      ],
      explanation: '条件分支：偶数输入除以 2，奇数输入乘以 2。',
    },
    'w5-p2': {
      title: '大小阈值门',
      description: '以 5 为界限，两端走向不同分支。',
      ruleDescription: '输入 > 5 则 +10，否则 ×2',
      hints: [
        '观察输入大于 5 和小于等于 5 的情况。',
        '2→4 (×2), 4→8 (×2), 但 6→16 (+10), 8→18 (+10)。',
        '9 大于 5，应该加 10。',
      ],
      explanation: '分支规则：若输入大于 5 则加 10，否则翻倍。',
    },
    'w6-p1': {
      title: '多重条件决策树',
      description: '深层逻辑隐藏在数字的整除特性之中。',
      ruleDescription: '能被 3 整除则 ÷3，否则 +2',
      hints: [
        '注意 6 和 9 变小了，而 4 和 7 变大了。',
        '6 ÷ 3 = 2, 9 ÷ 3 = 3；4 + 2 = 6, 7 + 2 = 9。',
        '12 能被 3 整除，所以执行除法。',
      ],
      explanation: '隐匿逻辑：若输入是 3 的倍数则除以 3，否则加 2。',
    },
    'w7-p1': {
      title: '双级嵌套管道',
      description: '子机器 α 处理完后，将结果立即送入子机器 β。',
      ruleDescription: '管道：[子机器 α: +1] → [子机器 β: ×2]',
      hints: [
        '尝试将整个过程拆分为两步。',
        '输入 2：第一步变成 3，第二步变成 6。',
        '输入 5：第一步变成 6，第二步变成 12。',
      ],
      explanation: '级联流水线：(输入 + 1) × 2 = 输出。',
    },
    'w8-p1': {
      title: '假说分歧：倍数 vs 加法',
      description: '初始样本无法区分到底是 ×2 还是 +3。',
      ruleDescription: '真实法则：×2 (通过测试输入 4 证明)',
      hints: [
        '样本 3 → 6 既符合 3 × 2 = 6，也符合 3 + 3 = 6。',
        '输入 4 时：若为 ×2 输出为 8，若为 +3 输出为 7。',
        '选择能够产生不同预测结果的测试输入！',
      ],
      explanation: '科学证伪法：通过测试输入 4，实际机器输出 8，证伪了 +3 假说，确认真实法则是 ×2！',
      ambiguityHypothesisA: '法则 A：输入乘以 2 (×2)',
      ambiguityHypothesisB: '法则 B：输入加上 3 (+3)',
    },
  },
  'zh-TW': {
    'w1-p1': {
      title: '倍增機器',
      description: '觀察數字進入機器核心後發生的變化。',
      ruleDescription: '將輸入乘以 2 (×2)',
      hints: [
        '觀察每組樣本中輸入與輸出的相對大小。',
        '輸出數值恰好是輸入數值的兩倍。',
        '計算 5 × 2 即可得到正確答案。',
      ],
      explanation: '機器會將穿過它的每一個數字翻倍：輸入 × 2 = 輸出。',
    },
    'w1-p2': {
      title: '加一能量泵',
      description: '能量倉內發生了微小增幅。',
      ruleDescription: '乘以 2 再加 1 (×2 + 1)',
      hints: [
        '先嘗試乘以 2，看看與輸出的差距。',
        '2 × 2 = 4 (輸出為 5)；3 × 2 = 6 (輸出為 7)。',
        '將 6 乘以 2 再加上 1。',
      ],
      explanation: '機器將輸入乘以 2 後再加 1：(輸入 × 2) + 1。',
    },
    'w1-p3': {
      title: '折半分流閥',
      description: '大數值經過機器後明顯縮減。',
      ruleDescription: '將輸入除以 2 (÷2)',
      hints: [
        '輸出明顯小於輸入。',
        '10 的一半是 5，14 的一半是 7。',
        '將 24 除以 2。',
      ],
      explanation: '機器將每個輸入減半：輸入 ÷ 2 = 輸出。',
    },
    'w1-p4': {
      title: '三倍壓縮機',
      description: '數字在核心受到三重聚變。',
      ruleDescription: '乘以 3 (×3)',
      hints: [
        '觀察輸出增長的倍率。',
        '2 變成 6，4 變成 12。',
        '將 7 乘以 3。',
      ],
      explanation: '機器將每個輸入乘以 3：輸入 × 3 = 輸出。',
    },
    'w2-p1': {
      title: '等差加速器',
      description: '數字序列正按照恆定速率穩步上升。',
      ruleDescription: '輸入遞增 4 (+4)',
      hints: [
        '比較相鄰樣本之間的增量差。',
        '每個輸出都比輸入大 4。',
        '計算 18 + 4。',
      ],
      explanation: '機器給輸入加上固定常數 4：輸入 + 4 = 輸出。',
    },
    'w2-p2': {
      title: '平方能量環',
      description: '輸出呈非線性爆發增長。',
      ruleDescription: '輸入的平方 (x²)',
      hints: [
        '輸出增長非常迅速。',
        '3 變成 9，4 變成 16，5 變成 25。',
        '計算 7 的平方 (7 × 7)。',
      ],
      explanation: '機器將輸入乘以自身：輸入 × 輸入 = 輸出。',
    },
    'w2-p3': {
      title: '費波那契諧振倉',
      description: '序列中前後數字正在發生奇妙交融。',
      ruleDescription: '求序列下一項 (前兩項之和)',
      hints: [
        '觀察序列中每個數字與前兩個數字的關係。',
        '1+1=2, 1+2=3, 2+3=5, 3+5=8。',
        '計算 5 + 8。',
      ],
      explanation: '經典的費波那契序列，下一項為前兩項之和：5 + 8 = 13。',
    },
    'w3-p1': {
      title: '順時針旋光儀',
      description: '符號在光束中發生空間旋轉。',
      ruleDescription: '順時針旋轉 90 度',
      hints: [
        '觀察箭頭的朝向變化。',
        '向上箭頭變成了向右箭頭。',
        '向左箭頭順時針旋轉 90 度後朝向哪裡？',
      ],
      explanation: '機器將所有圖形順時針旋轉 90°。',
    },
    'w3-p2': {
      title: '色譜極化器',
      description: '紅藍兩極在機器中發生置換。',
      ruleDescription: '紅色與藍色互換',
      hints: [
        '幾何形狀未變，觀察顏色改變。',
        '紅色正方形變成了藍色正方形。',
        '藍色圓形經過機器後會變成什麼顏色？',
      ],
      explanation: '機器將紅色變為藍色，藍色變為紅色。',
    },
    'w3-p3': {
      title: '幾何變種器',
      description: '邊數似乎在發生規律性遞增。',
      ruleDescription: '邊數 + 1 (三角形→正方形→五邊形)',
      hints: [
        '數一數輸入與輸出圖形的邊數。',
        '3條邊（三角形）變成 4條邊（正方形）。',
        '4條邊（正方形）變換後會變成幾條邊？',
      ],
      explanation: '機器為每一個多邊形增加一條邊：三角形(3) → 正方形(4) → 五邊形(5)。',
    },
    'w4-p1': {
      title: '雙階強化機',
      description: '數字在兩個加工倉中連續經過兩次處理。',
      ruleDescription: '×2 + 3',
      hints: [
        '先乘再加。嘗試倍增後再補足差值。',
        '2 × 2 = 4 (+3 = 7)；4 × 2 = 8 (+3 = 11)。',
        '先將 6 乘以 2，再加上 3。',
      ],
      explanation: '複合管線：先將輸入乘以 2，再加 3。',
    },
    'w4-p2': {
      title: '逆序衰減機',
      description: '先放大，再扣除損耗。',
      ruleDescription: '×3 - 2',
      hints: [
        '輸出接近輸入的 3 倍，但略微偏小。',
        '2 × 3 = 6 (-2 = 4)；3 × 3 = 9 (-2 = 7)。',
        '組裝：[×] [3] [-] [2]。',
      ],
      explanation: '機器先將輸入乘以 3，然後減去 2。',
    },
    'w5-p1': {
      title: '奇偶選擇器',
      description: '偶數與奇數在核心遭遇了截然不同的命運。',
      ruleDescription: '若為偶數則 ÷2，若為奇數則 ×2',
      hints: [
        '分別看偶數樣本（4→2, 6→3）與奇數樣本（3→6, 5→10）。',
        '偶數被折半，奇數被翻倍。',
        '7 是奇數，所以應該如何計算？',
      ],
      explanation: '條件分支：偶數輸入除以 2，奇數輸入乘以 2。',
    },
    'w5-p2': {
      title: '大小閾值門',
      description: '以 5 為界限，兩端走向不同分支。',
      ruleDescription: '輸入 > 5 則 +10，否則 ×2',
      hints: [
        '觀察輸入大於 5 和小於等於 5 的情況。',
        '2→4 (×2), 4→8 (×2), 但 6→16 (+10), 8→18 (+10)。',
        '9 大於 5，應該加 10。',
      ],
      explanation: '分支規則：若輸入大於 5 則加 10，否則翻倍。',
    },
    'w6-p1': {
      title: '多重條件決策樹',
      description: '深層邏輯隱藏在數字的整除特性之中。',
      ruleDescription: '能被 3 整除則 ÷3，否則 +2',
      hints: [
        '注意 6 和 9 變小了，而 4 和 7 變大了。',
        '6 ÷ 3 = 2, 9 ÷ 3 = 3；4 + 2 = 6, 7 + 2 = 9。',
        '12 能被 3 整除，所以執行除法。',
      ],
      explanation: '隱匿邏輯：若輸入是 3 的倍數則除以 3，否則加 2。',
    },
    'w7-p1': {
      title: '雙級巢狀管道',
      description: '子機器 α 處理完後，將結果立即送入子機器 β。',
      ruleDescription: '管線：[子機器 α: +1] → [子機器 β: ×2]',
      hints: [
        '嘗試將整個過程拆分為兩步。',
        '輸入 2：第一步變成 3，第二步變成 6。',
        '輸入 5：第一步變成 6，第二步變成 12。',
      ],
      explanation: '級聯管線：(輸入 + 1) × 2 = 輸出。',
    },
    'w8-p1': {
      title: '假說分歧：倍數 vs 加法',
      description: '初始樣本無法區分到底是 ×2 還是 +3。',
      ruleDescription: '真實法則：×2 (通過測試輸入 4 證明)',
      hints: [
        '樣本 3 → 6 既符合 3 × 2 = 6，也符合 3 + 3 = 6。',
        '輸入 4 時：若為 ×2 輸出為 8，若為 +3 輸出為 7。',
        '選擇能夠產生不同預測結果的測試輸入！',
      ],
      explanation: '科學證偽法：通過測試輸入 4，實際機器輸出 8，證偽了 +3 假說，確認真實法則是 ×2！',
      ambiguityHypothesisA: '法則 A：輸入乘以 2 (×2)',
      ambiguityHypothesisB: '法則 B：輸入加上 3 (+3)',
    },
  },
};
