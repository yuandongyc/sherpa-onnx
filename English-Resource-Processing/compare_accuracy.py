import json
import re
from difflib import SequenceMatcher
from pathlib import Path

def parse_srt(srt_path):
    with open(srt_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    segments = re.findall(r'\d+\n\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}\n(.*?)(?=\n\n|\Z)', content, re.DOTALL)
    text = ' '.join([seg.strip() for seg in segments])
    return text

def read_json(json_path):
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data.get('fullText', '')

def calculate_accuracy(reference, hypothesis):
    ref = reference.lower().strip()
    hyp = hypothesis.lower().strip()
    
    if not ref:
        return 0.0
    
    matcher = SequenceMatcher(None, ref, hyp)
    ratio = matcher.ratio()
    
    return ratio * 100

def calculate_word_error_rate(reference, hypothesis):
    ref_words = reference.lower().split()
    hyp_words = hypothesis.lower().split()
    
    if not ref_words:
        return 100.0
    
    from difflib import SequenceMatcher
    matcher = SequenceMatcher(None, ref_words, hyp_words)
    ratio = matcher.ratio()
    
    return (1 - ratio) * 100

def main():
    base_dir = Path(r'D:\MyProjects\c_projects\sherpa-onnx\English-Resource-Processing')
    correct_dir = base_dir / 'a_rights' / 'v3'
    transcriber_dir = base_dir / 'audio-transcriber-all'
    
    models = [
        'audio-transcriber-base',
        'audio-transcriber-moonshine-base-int8',
        'audio-transcriber-moonshine-tiny-int8',
        'audio-transcriber-small',
        'audio-transcriber-tiny',
        'audio-transcriber-tiny-v4',
        'audio-transcriber-zipformer',
        'audio-transcriber-zipformer-ctc'
    ]
    
    videos = ['video2', 'video4', 'video6']
    
    print('=' * 80)
    print('语音识别模型准确率比较')
    print('=' * 80)
    
    results = {}
    
    for video in videos:
        srt_path = correct_dir / f'{video}.srt'
        correct_text = parse_srt(srt_path)
        
        print(f'\n{video.upper()} 结果:')
        print('-' * 80)
        
        for model in models:
            json_path = transcriber_dir / model / 'files' / f'{video}.json'
            if json_path.exists():
                transcribed_text = read_json(json_path)
                
                accuracy = calculate_accuracy(correct_text, transcribed_text)
                wer = calculate_word_error_rate(correct_text, transcribed_text)
                
                if model not in results:
                    results[model] = {'accuracy': [], 'wer': []}
                results[model]['accuracy'].append(accuracy)
                results[model]['wer'].append(wer)
                
                print(f'{model:40s} 准确率: {accuracy:5.2f}%  WER: {wer:5.2f}%')
    
    print('\n' + '=' * 80)
    print('平均准确率排名 (按准确率从高到低):')
    print('=' * 80)
    
    avg_results = []
    for model, data in results.items():
        avg_acc = sum(data['accuracy']) / len(data['accuracy'])
        avg_wer = sum(data['wer']) / len(data['wer'])
        avg_results.append((model, avg_acc, avg_wer))
    
    avg_results.sort(key=lambda x: x[1], reverse=True)
    
    for i, (model, avg_acc, avg_wer) in enumerate(avg_results, 1):
        print(f'{i:2d}. {model:40s} 平均准确率: {avg_acc:5.2f}%  平均WER: {avg_wer:5.2f}%')
    
    print('\n' + '=' * 80)
    print(f'最佳模型: {avg_results[0][0]} (准确率: {avg_results[0][1]:.2f}%)')
    print('=' * 80)

if __name__ == '__main__':
    main()
