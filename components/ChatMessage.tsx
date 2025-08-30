import React, { useRef, useEffect } from 'react';
import { type ChatMessage, Sender } from '../types';

interface ChatMessageProps {
  message: ChatMessage;
}

// Since Chart.js is loaded from a CDN, we declare it globally for TypeScript
declare var Chart: any;

// Helper function to parse and render text with **bold** markdown
const renderBoldText = (text: string) => {
  if (!text) return text;
  
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.sender === Sender.Bot;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const messageClasses = isBot
    ? 'bg-white text-gray-800 self-start border border-gray-200'
    : 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white self-end';

  const containerClasses = isBot ? 'flex items-start' : 'flex justify-end';

  // --- Chart Rendering Logic ---
  const taxSummaryRegex = /\[TAX_SUMMARY:\s*({.*})\]/s;
  const match = message.text.match(taxSummaryRegex);
  let taxData: any = null;
  let cleanedText = message.text;

  if (match && match[1]) {
    try {
      taxData = JSON.parse(match[1]);
      cleanedText = message.text.replace(taxSummaryRegex, '').trim();
    } catch (e) {
      console.error("Failed to parse tax summary JSON:", e);
      taxData = null; // Reset on error
      cleanedText = message.text;
    }
  }
  
  useEffect(() => {
    if (!taxData || !canvasRef.current) return;

    const existingChart = Chart.getChart(canvasRef.current);
    if (existingChart) {
      existingChart.destroy();
    }
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Income', 'Deductions', 'Tax', 'Refund'],
            datasets: [{
                label: `Amount in ${taxData.currency || '$'}`,
                data: [
                    taxData.totalIncome, 
                    taxData.deductions, 
                    taxData.taxPayable, 
                    taxData.refund
                ],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(201, 203, 207, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(75, 192, 192, 0.6)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(201, 203, 207, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context: any) {
                            let label = context.dataset.label || '';
                            if (label) { label += ': '; }
                            if (context.parsed.y !== null) {
                                try {
                                    label += new Intl.NumberFormat('en-US', { style: 'currency', currency: taxData.currency || 'USD' }).format(context.parsed.y);
                                } catch (e) {
                                    label += (taxData.currency || '$') + context.parsed.y;
                                }
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value: number) {
                            if (value >= 1000) {
                                return (taxData.currency || '$') + value / 1000 + 'k';
                            }
                            return (taxData.currency || '$') + value;
                        }
                    }
                }
            }
        }
    });

    return () => {
        chart.destroy();
    };
  }, [taxData]); // Re-run effect if taxData changes

  // Renders message content, parsing markdown for lists and bold text.
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    const blocks: Array<{ type: 'p' | 'ul'; content: string[] }> = [];
    let currentBlock: { type: 'p' | 'ul'; content: string[] } | null = null;

    lines.forEach(line => {
      const isListItem = /^\s*[-*]/.test(line);
      const blockType = isListItem ? 'ul' : 'p';

      if (!currentBlock || currentBlock.type !== blockType) {
        if (currentBlock && currentBlock.content.join('').trim()) {
          blocks.push(currentBlock);
        }
        currentBlock = { type: blockType, content: [] };
      }
      
      currentBlock.content.push(line);
    });

    if (currentBlock && currentBlock.content.join('').trim()) {
      blocks.push(currentBlock);
    }
    
    return blocks.map((block, index) => {
      if (block.type === 'ul') {
        return (
          <ul key={index} className="list-disc list-inside space-y-1 my-1">
            {block.content.map((item, i) => {
              const content = item.replace(/^\s*[-*]\s*/, '');
              return <li key={i}>{renderBoldText(content)}</li>;
            })}
          </ul>
        );
      } else { // 'p'
        return (
          <div key={index} className="whitespace-pre-wrap">
            {renderBoldText(block.content.join('\n'))}
          </div>
        );
      }
    });
  };

  return (
    <div className={`w-full ${containerClasses}`}>
      {isBot && (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white font-bold text-md mr-3 flex-shrink-0 shadow">
          A
        </div>
      )}
      <div className={`max-w-xl md:max-w-2xl px-4 py-3 rounded-xl shadow-md ${messageClasses}`}>
        {taxData && (
            <div className="mb-3">
                <canvas ref={canvasRef} id={`chart-${message.id}`} width="400" height="250" aria-label="Tax summary bar chart" role="img"></canvas>
            </div>
        )}
        <div className="text-base leading-relaxed">{renderContent(cleanedText)}</div>
      </div>
    </div>
  );
};

export default ChatMessageComponent;