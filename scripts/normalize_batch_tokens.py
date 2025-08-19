"""Normalize Korean domain tokens in docs/batch files to English equivalents.
Creates backups under docs/batch_auto_backup and modifies files in place.
"""
import os
import shutil

root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'docs', 'batch'))
backup_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'docs', 'batch_auto_backup'))

mapping = {
    '일상생활': 'daily',
    '일상': 'daily',
    '음식': 'food',
    '기술': 'technology',
    '사업': 'business',
    '비즈니스': 'business',
    '건강': 'health',
    '문화': 'culture',
    '자연': 'nature',
    '스포츠': 'sports',
    '엔터테인먼트': 'entertainment',
    '여행': 'travel',
    '교육': 'education',
    '기타': 'other',
    '사회': 'social',
    '업무': 'work'
}

changed_files = []
if not os.path.exists(backup_root):
    os.makedirs(backup_root)

for fname in os.listdir(root):
    if not fname.endswith('.md'):
        continue
    fpath = os.path.join(root, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        text = f.read()
    new_text = text
    for kor, eng in mapping.items():
        new_text = new_text.replace(f'{kor}_{{word}}_{{meaning}}', f'{eng}_{{word}}_{{meaning}}')
    if new_text != text:
        # backup
        shutil.copy2(fpath, os.path.join(backup_root, fname))
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_text)
        changed_files.append(fname)

print(f'Processed {len(list(os.listdir(root)))} files in docs/batch; modified {len(changed_files)} files.')
if changed_files:
    print('Modified files:')
    for f in changed_files:
        print(' -', f)
else:
    print('No files modified.')
