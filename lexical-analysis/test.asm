.386
.model{small}

.data
	Var0   db	-0001b
	Var1   db	0001b
	Var2   dw	17
	Var3   dd	000FFh
	QWER   dw   432

.code
	vAri3  dd	67FF89h
beg:
label1:
	cli
	mov Var3, -0101b
	add ecx, ebx
	add ebx, vAri3
	add cx, ax
	mov dword ptr [edx + esi], 010h
	and ebx, [ebx + ecx]
	mov dword ptr [edx + esi], 0FFh
	mov dword ptr [edx + esi], 4312h
	mov byte ptr [edx + esi], 0FFh
	mov word ptr [edx + esi], 0FFh
	div ah
	or eax, 0101b
	imul Var3
	cmp [si], eax
	ja label1
	jmp label2
label2:
	cmp [edx + esi], ax
	cmp [edx + ecx], ebx
	cmp Var2, cx
	cmp Var3, ebx
	ja label2
	jmp label1
end beg
