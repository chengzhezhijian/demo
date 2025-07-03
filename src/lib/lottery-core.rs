use wasm_bindgen::prelude::*;
use seahash::SeaHasher;
use std::hash::{Hash, Hasher};

// 编译WASM模块
#[wasm_bindgen]
pub fn compile_wasm() -> Result<(), JsValue> {
    // 初始化日志
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
    Ok(())
}

// 抽奖算法实现
#[wasm_bindgen]
pub fn lottery_algorithm(probabilities: &[f64]) -> usize {
    // 计算总概率
    let total: f64 = probabilities.iter().sum();
    if total <= 0.0 {
        return 0;
    }

    // 生成基于当前时间和随机数的种子
    let mut hasher = SeaHasher::new();
    let now = js_sys::Date::now() as u64;
    let rand = js_sys::Math::random() as f64;
    now.hash(&mut hasher);
    rand.to_bits().hash(&mut hasher);
    let seed = hasher.finish() as f64 / u64::MAX as f64;

    // 计算随机值在总概率中的位置
    let random_value = seed * total;
    let mut cumulative = 0.0;

    // 找到中奖项
    for (i, &prob) in probabilities.iter().enumerate() {
        cumulative += prob;
        if random_value <= cumulative {
            return i;
        }
    }

    // 兜底返回最后一项
    probabilities.len() - 1
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_lottery_algorithm() {
        // 测试概率分布
        let probabilities = vec![1.0, 2.0, 3.0, 4.0];
        let mut counts = vec![0; probabilities.len()];
        let total_tests = 100000;

        for _ in 0..total_tests {
            let result = lottery_algorithm(&probabilities);
            counts[result] += 1;
        }

        // 验证每个结果的比例大致符合概率分布
        let total_prob: f64 = probabilities.iter().sum();
        for (i, &prob) in probabilities.iter().enumerate() {
            let expected_ratio = prob / total_prob;
            let actual_ratio = counts[i] as f64 / total_tests as f64;
            assert!((actual_ratio - expected_ratio).abs() < 0.02);
        }
    }

    #[test]
    fn test_edge_cases() {
        // 测试空数组
        assert_eq!(lottery_algorithm(&[]), 0);

        // 测试单元素
        assert_eq!(lottery_algorithm(&[1.0]), 0);

        // 测试零概率
        assert_eq!(lottery_algorithm(&[0.0, 0.0, 1.0]), 2);
    }
}