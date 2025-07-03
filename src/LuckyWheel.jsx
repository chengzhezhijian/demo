import { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, Paper, CircularProgress, Alert, Grid, Card, CardContent } from '@mui/material';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useToken } from 'antd';
import { compileWASM, lotteryAlgorithm } from './lib/lottery-core';

const LuckyWheel = ({ username }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [prizeList] = useState([
    { id: 1, name: '一等奖', value: 'iPhone 15', probability: 0.5 },
    { id: 2, name: '二等奖', value: 'AirPods Pro', probability: 2 },
    { id: 3, name: '三等奖', value: '100元代金券', probability: 5 },
    { id: 4, name: '四等奖', value: '50元代金券', probability: 10 },
    { id: 5, name: '五等奖', value: '20元代金券', probability: 20 },
    { id: 6, name: '谢谢参与', value: '再接再厉', probability: 62.5 },
  ]);
  const rotation = useMotionValue(0);
  const wheelRef = useRef(null);
  const [token] = useToken();

  // 编译WASM模块
  useEffect(() => {
    const initWASM = async () => {
      try {
        await compileWASM();
        setIsLoading(false);
      } catch (err) {
        console.error('WASM initialization failed:', err);
        setError('抽奖核心模块加载失败，请刷新页面重试');
        setIsLoading(false);
      }
    };

    initWASM();
  }, []);

  // 计算旋转角度到奖品的映射
  const getPrizeByRotation = (degrees) => {
    const normalizedDegrees = degrees % 360;
    const anglePerPrize = 360 / prizeList.length;
    const index = Math.floor((360 - normalizedDegrees) / anglePerPrize) % prizeList.length;
    return prizeList[index];
  };

  // 处理抽奖逻辑
  const handleSpin = async () => {
    if (isSpinning || isLoading) return;

    setIsSpinning(true);
    setResult(null);
    setError(null);

    try {
      // 使用WASM核心算法计算中奖结果
      const startTime = performance.now();
      const resultIndex = lotteryAlgorithm(prizeList.map(p => p.probability));
      const endTime = performance.now();
      console.log(`WASM执行时间: ${endTime - startTime}ms`);

      // 计算旋转角度 (3圈 + 目标位置)
      const baseRotation = rotation.get() + 3 * 360;
      const targetRotation = baseRotation + (resultIndex * (360 / prizeList.length)) + 15;

      // 执行旋转动画
      await animate(rotation, targetRotation, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        mass: 1,
        duration: 5
      });

      // 显示结果
      const winningPrize = prizeList[resultIndex];
      setResult(winningPrize);

      // 发送抽奖结果到分析服务
      if (typeof window !== 'undefined' && window.sentry) {
        window.sentry.addBreadcrumb({
          message: `User ${username} won ${winningPrize.name}: ${winningPrize.value}`,
          category: 'lottery',
          level: 'info'
        });
      }
    } catch (err) {
      console.error('抽奖过程出错:', err);
      setError('抽奖过程中出现错误，请重试');
    } finally {
      setIsSpinning(false);
    }
  };

  // 计算每个奖品的角度和样式
  const prizeAngle = 360 / prizeList.length;
  const wheelColors = [
    token.colorPrimary,
    token.colorSuccess,
    token.colorWarning,
    token.colorInfo,
    token.colorError,
    token.colorTextTertiary,
  ];

  // 旋转变换
  const rotateTransform = useTransform(rotation, v => `rotate(${v}deg)`);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, maxWidth: 800, margin: '0 auto', width: '100%' }}>
      <Typography variant="h4" align="center" gutterBottom>
        幸运大转盘
      </Typography>

      {username && (
        <Typography variant="body1" align="center" sx={{ mb: 4 }}>
          欢迎回来，{username}！祝你好运！
        </Typography>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
      )}

      <Grid container spacing={4} alignItems="center" justifyContent="center">
        <Grid item xs={12} md={8} lg={6} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Paper
            elevation={4}
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: 400,
              aspectRatio: '1/1',
              borderRadius: '50%',
              overflow: 'hidden',
              border: `4px solid ${token.colorBorderAlt}`,
            }}
          >
            <motion.div
              ref={wheelRef}
              style={{ transform: rotateTransform }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {prizeList.map((prize, index) => (
                <div
                  key={prize.id}
                  style={{
                    position: 'absolute',
                    width: '50%',
                    height: '50%',
                    left: '50%',
                    top: 0,
                    transformOrigin: 'bottom left',
                    transform: `rotate(${index * prizeAngle}deg)`,
                    backgroundColor: wheelColors[index % wheelColors.length],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px',
                  }}
                >
                  <div
                    style={{
                      transform: `rotate(${prizeAngle / 2}deg) translateX(30%)`,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      width: '60%',
                      textAlign: 'center',
                    }}
                  >
                    {prize.name}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* 转盘中心 */}
            <div
              style={{
                position: 'absolute',
                width: '20%',
                height: '20%',
                borderRadius: '50%',
                backgroundColor: token.colorBgContainer,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                border: `4px solid ${token.colorBorderAlt}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isSpinning ? 'not-allowed' : 'pointer',
              }}
              onClick={handleSpin}
            >
              <Typography variant="button" fontWeight="bold">
                {isSpinning ? '抽奖中...' : '开始抽奖'}
              </Typography>
            </div>
          </Paper>
        </Grid>

        {/* 奖品列表 */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>奖品设置</Typography>
              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {prizeList.map((prize) => (
                  <Box key={prize.id} sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>{prize.name}: {prize.value}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {prize.probability}%
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 抽奖结果 */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          sx={{ mt: 4 }}
        >
          <Alert severity={result.id <= 5 ? "success" : "info"} sx={{ fontSize: 18, py: 3 }}>
            {result.id <= 5 ? (
              <>恭喜您获得{result.name}：{result.value}！</>
            ) : (
              <>很遗憾，{result.value}，下次再来试试吧！</>
            )}
          </Alert>
        </motion.div>
      )}
    </Box>
  );
};

export default LuckyWheel;