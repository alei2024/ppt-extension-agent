#!/usr/bin/env python3
"""测试API返回的图片数据"""
import requests
import json
from pathlib import Path

# 上传一个PPT文件
ppt_file = "/Users/yangyuntian/Desktop/My doc/华东师范大学各类活动与事情/S3/云计算系统/LAB/大作业/ppt-extension-agent/uploads/42f00f9c-9d6c-44ab-a92f-709065d793e7_期末汇报.pptx"

if not Path(ppt_file).exists():
    print(f"文件不存在: {ppt_file}")
    exit(1)

with open(ppt_file, 'rb') as f:
    files = {'file': ('test.pptx', f, 'application/vnd.openxmlformats-officedocument.presentationml.presentation')}
    response = requests.post('http://localhost:8000/api/v1/upload', files=files)

if response.status_code == 200:
    data = response.json()
    print("✅ API调用成功\n")
    
    # 检查返回结构
    print(f"返回的键: {data.keys()}")
    print(f"PPT数据键: {data['ppt_data'].keys()}")
    print(f"幻灯片数量: {len(data['ppt_data']['slides'])}\n")
    
    # 检查第一页的图片
    if data['ppt_data']['slides']:
        slide1 = data['ppt_data']['slides'][0]
        print(f"=== 第1页 ===")
        print(f"标题: {slide1.get('title', '无')}")
        print(f"文本框数量: {len(slide1.get('text_boxes', []))}")
        print(f"图片数量: {len(slide1.get('images', []))}")
        
        if slide1.get('images'):
            print(f"\n图片详情:")
            for i, img in enumerate(slide1['images'][:3], 1):
                print(f"\n图片 {i}:")
                print(f"  ID: {img.get('id')}")
                print(f"  路径: {img.get('file_path')}")
                print(f"  描述: {img.get('description', '无')[:100]}")
                print(f"  OCR: {img.get('ocr_text', '无')[:100]}")
        else:
            print("\n⚠️ 第1页没有图片数据！")
    
    # 统计有图片的页面
    slides_with_images = [s for s in data['ppt_data']['slides'] if s.get('images')]
    print(f"\n\n=== 统计 ===")
    print(f"有图片的页面数: {len(slides_with_images)}/{len(data['ppt_data']['slides'])}")
    
    if slides_with_images:
        total_images = sum(len(s['images']) for s in slides_with_images)
        print(f"总图片数: {total_images}")
else:
    print(f"❌ API调用失败: {response.status_code}")
    print(response.text)
