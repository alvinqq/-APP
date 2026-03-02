import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Play, Pause, CheckCircle, Clock, FileText, Video } from 'lucide-react';

interface TrainingStudyPageProps {
  trainingId: string;
  title: string;
  type: 'video' | 'document';
  contentUrl: string;
  onComplete: () => void;
  onBack: () => void;
}

export default function TrainingStudyPage({ trainingId, title, type, contentUrl, onComplete, onBack }: TrainingStudyPageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playTime, setPlayTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasReachedFirstPage, setHasReachedFirstPage] = useState(true);
  const [hasReachedLastPage, setHasReachedLastPage] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const documentRef = useRef<HTMLDivElement>(null);

  const MIN_PLAY_TIME = 5;

  useEffect(() => {
    if (type === 'video' && isPlaying && videoRef.current) {
      const interval = setInterval(() => {
        setPlayTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= MIN_PLAY_TIME && hasStarted) {
            setIsCompleted(true);
          }
          return newTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPlaying, hasStarted, type]);

  useEffect(() => {
    if (type === 'document' && hasReachedFirstPage && hasReachedLastPage) {
      setIsCompleted(true);
    }
  }, [hasReachedFirstPage, hasReachedLastPage, type]);

  const handlePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        setHasStarted(true);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleScroll = () => {
    if (type === 'document' && documentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = documentRef.current;
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollProgress(progress);

      if (scrollTop === 0) {
        setHasReachedFirstPage(true);
      }

      // 更准确的底部检测
      if (scrollTop + clientHeight >= scrollHeight - 1) {
        setHasReachedLastPage(true);
      }
    }
  };

  const handleComplete = () => {
    if (isCompleted) {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="font-bold text-gray-800 text-sm flex-1 truncate">{title}</h1>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock size={14} />
          <span>{type === 'video' ? `${playTime}s / ${MIN_PLAY_TIME}s` : `${Math.round(scrollProgress)}%`}</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {type === 'video' ? (
          <div className="bg-black aspect-video flex items-center justify-center relative">
            <video
              ref={videoRef}
              src={contentUrl}
              className="w-full h-full object-contain"
              onEnded={() => setIsPlaying(false)}
            />
            {!isPlaying && (
              <button
                onClick={handlePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
              >
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                  <Play size={32} className="text-gray-800 ml-1" />
                </div>
              </button>
            )}
            {isPlaying && (
              <button
                onClick={handlePlay}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/90 rounded-full flex items-center gap-2 hover:bg-white transition-colors"
              >
                <Pause size={16} className="text-gray-800" />
                <span className="text-sm font-medium text-gray-800">暂停</span>
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white min-h-[calc(100vh-4rem)] p-6 overflow-y-auto">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 pb-4 border-b">
                <FileText size={16} />
                <span>文档预览</span>
              </div>
              
              <div
                ref={documentRef}
                onScroll={handleScroll}
                className="space-y-4 text-gray-700 leading-relaxed max-h-[calc(100vh-8rem)] overflow-y-auto"
              >
                <h2 className="text-xl font-bold text-gray-800">第一章：基础知识</h2>
                <p>这里是培训文档的第一页内容。请仔细阅读以下内容...</p>
                <p>培训内容涵盖了产品知识、销售技巧、服务规范等多个方面。</p>
                <p>作为一名店员，了解基本的产品知识是非常重要的。这不仅有助于你更好地为客户服务，还能提高你的销售业绩。</p>
                <p>基础知识包括产品的基本信息、功能特点、使用方法等。这些知识是你开展工作的基础。</p>
                
                <h2 className="text-xl font-bold text-gray-800">第二章：产品介绍</h2>
                <p>我们的产品具有以下特点：高品质、高性价比、优质服务。</p>
                <p>产品规格：A类产品、B类产品、C类产品，满足不同客户需求。</p>
                <p>A类产品：高端产品，质量最好，价格较高，适合对品质有较高要求的客户。</p>
                <p>B类产品：中端产品，性价比高，适合大多数客户。</p>
                <p>C类产品：入门级产品，价格实惠，适合预算有限的客户。</p>
                
                <h2 className="text-xl font-bold text-gray-800">第三章：销售技巧</h2>
                <p>销售过程中需要注意的要点：了解客户需求、推荐合适产品、提供专业建议。</p>
                <p>成交技巧：建立信任、突出价值、解决顾虑、促成交易。</p>
                <p>建立信任：通过专业的态度和知识，赢得客户的信任。</p>
                <p>突出价值：向客户展示产品的价值和优势。</p>
                <p>解决顾虑：及时解答客户的疑问和顾虑。</p>
                <p>促成交易：在适当的时机，引导客户完成购买。</p>
                
                <h2 className="text-xl font-bold text-gray-800">第四章：服务规范</h2>
                <p>服务标准：热情接待、专业解答、及时跟进、售后保障。</p>
                <p>客户满意度是我们工作的核心目标。</p>
                <p>热情接待：微笑服务，主动问候客户。</p>
                <p>专业解答：用专业知识解答客户的问题。</p>
                <p>及时跟进：对客户的需求和反馈及时跟进。</p>
                <p>售后保障：提供完善的售后服务，确保客户满意。</p>
                
                <h2 className="text-xl font-bold text-gray-800">第五章：总结</h2>
                <p>通过本次培训，您应该掌握了：产品知识、销售技巧、服务规范。</p>
                <p>请在实际工作中运用所学知识，不断提升服务质量。</p>
                <p>记住，优质的服务是我们赢得客户的关键。</p>
                <p>不断学习和提升自己，是我们成长的必经之路。</p>
                <p>希望本次培训对您有所帮助，祝您工作顺利！</p>
                <p>培训文档结束，感谢您的学习！</p>
                <p>附加内容：为了测试滚动功能，这里增加了一些额外的内容。</p>
                <p>请滚动到文档底部，以完成学习。</p>
                <p>感谢您的耐心阅读！</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-100 p-4 sticky bottom-0 z-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm">
              {type === 'video' ? (
                <Video size={16} className="text-gray-500" />
              ) : (
                <FileText size={16} className="text-gray-500" />
              )}
              <span className="text-gray-600">
                {type === 'video' ? '视频学习' : '文档阅读'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle size={16} />
                  <span className="text-sm font-medium">已完成</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-amber-600">
                  <Clock size={16} />
                  <span className="text-sm">
                    {type === 'video' 
                      ? `还需播放 ${MIN_PLAY_TIME - playTime} 秒` 
                      : hasReachedLastPage ? '已完成' : '请滚动到文档底部'}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {type === 'video' && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((playTime / MIN_PLAY_TIME) * 100, 100)}%` }}
              />
            </div>
          )}
          
          {type === 'document' && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
          )}
          
          <button
            onClick={handleComplete}
            disabled={!isCompleted}
            className={`w-full py-3 rounded-xl font-medium text-sm transition-all ${
              isCompleted 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isCompleted ? '完成学习' : type === 'video' ? '请先观看视频' : '请先阅读文档'}
          </button>
        </div>
      </footer>
    </div>
  );
}
